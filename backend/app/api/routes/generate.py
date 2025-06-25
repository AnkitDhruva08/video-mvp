from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.models.video import Video
from app.core.database import get_db
import requests
import json
import os
from datetime import datetime
from gtts import gTTS
from moviepy.editor import AudioFileClip, ColorClip, CompositeVideoClip, TextClip
from moviepy.config import change_settings
from PIL import ImageFont
import textwrap
import re

router = APIRouter()

class TopicRequest(BaseModel):
    topic: str

VIDEO_FOLDER = "video_outputs"
os.makedirs(VIDEO_FOLDER, exist_ok=True)

change_settings({"IMAGEMAGICK_BINARY": "/usr/bin/convert"})

@router.post("/generate-script")
async def generate_script(data: TopicRequest, db: Session = Depends(get_db)):
    print("⏩ Received request from frontend with topic:", data.topic)
    try:
        prompt = f"""Write a short engaging script (50-100 words) for a video on: {data.topic}.
        Structure it with distinct segments, like:
        [Segment 1: Title]
        Narrator: "..."
        [Segment 2: Topic Point 1]
        Narrator: "..."
        [Segment 3: Topic Point 2]
        Narrator: "..."
        [Segment 4: Conclusion]
        Narrator: "..."
        """
        print("📝 Generated prompt for model:", prompt)

        response = requests.post(
            "http://localhost:11434/api/generate",
            json={"model": "mistral", "prompt": prompt},
            stream=True
        )
        response.raise_for_status()

        script_parts = []
        for line in response.iter_lines():
            if line:
                try:
                    chunk = line.decode("utf-8")
                    data_chunk = json.loads(chunk)
                    script_parts.append(data_chunk.get("response", ""))
                except Exception:
                    print("⚠️ Skipping malformed line:", line)

        full_script = "".join(script_parts).strip()
        print("✅ Final script generated:", full_script)
        timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
        base_filename = f"{data.topic.replace(' ', '_')}_{timestamp}"

        new_video = Video(
            title=data.topic,
            script=full_script,
            file_name=base_filename + ".mp4", 
        )
        db.add(new_video)
        db.commit()
        db.refresh(new_video)
        print(f"💾 Saved script to DB with ID {new_video.id}")
        
        audio_path = os.path.join(VIDEO_FOLDER, base_filename + ".mp3")
        video_path = os.path.join(VIDEO_FOLDER, base_filename + ".mp4")
        
        print("🔊 Generating speech audio...")
        tts = gTTS(text=full_script)
        tts.save(audio_path)

        audio_clip = AudioFileClip(audio_path)
        duration = audio_clip.duration

        background_clip = ColorClip(size=(1280, 720), color=(0, 0, 0), duration=duration)

        all_video_elements = []
        current_time = 0

        sentences = re.split(r'(?<=[.!?])\s+', full_script)
        
        words_per_second = len(full_script.split()) / duration
        
        text_clips = []

        for sentence in sentences:
            sentence_words = len(sentence.split())
            sentence_duration = sentence_words / words_per_second if words_per_second > 0 else (duration / len(sentences))

            txt_clip = (TextClip(sentence,
                                 fontsize=50,
                                 color='white',
                                 font='Arial-Bold',
                                 stroke_color='black',
                                 stroke_width=1,
                                 size=(1280 - 100, None),
                                 method='caption',
                                 align='center'
                                )
                        .set_position('center')
                        .set_duration(sentence_duration)
                        .set_start(current_time)
                        .set_fps(24))
            text_clips.append(txt_clip)

            current_time += sentence_duration
        
        final_clips = []
        for clip in text_clips:
            if clip.end > duration:
                clip = clip.set_end(duration)
            final_clips.append(clip)

        video = CompositeVideoClip([background_clip] + final_clips, size=(1280, 720))
        video = video.set_audio(audio_clip)

        print(f"🎥 Writing final video to: {video_path}")
        video.write_videofile(video_path, codec="libx264", audio_codec="aac", fps=24)

        if os.path.exists(audio_path):
            os.remove(audio_path)

        print(f"✅ Video successfully created and saved: {video_path}")
        return {
            "script": full_script,
            "video_id": new_video.id,
            "video_path": video_path
        }

    except Exception as e:
        print("❌ Error while generating video:", str(e))
        raise HTTPException(status_code=500, detail=f"Error generating video: {str(e)}")