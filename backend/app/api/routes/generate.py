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
from moviepy.editor import AudioFileClip, ColorClip, CompositeVideoClip, ImageClip
from moviepy.config import change_settings
from PIL import Image, ImageDraw, ImageFont
import textwrap

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
        prompt = f"Write a short engaging script (50-100 words) for a video on: {data.topic}"
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

        # new_video = Video(title=data.topic, script=full_script)
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
        temp_text_image_path = os.path.join(VIDEO_FOLDER, f"temp_text_{timestamp}.png")

        print("🔊 Generating speech audio...")
        tts = gTTS(text=full_script)
        tts.save(audio_path)

        audio_clip = AudioFileClip(audio_path)
        duration = audio_clip.duration

        background_clip = ColorClip(size=(1280, 720), color=(0, 0, 0), duration=duration)

        image_size = (1280, 720)
        text_color = (255, 255, 255)
        bg_color = (0, 0, 0, 0)

        text_image = Image.new('RGBA', image_size, bg_color)
        draw = ImageDraw.Draw(text_image)

        font_path = "arial.ttf"
        font_size = 60
        try:
            font = ImageFont.truetype(font_path, font_size)
        except IOError:
            print(f"Font '{font_path}' not found, using default font.")
            font = ImageFont.load_default()

        max_pixel_width = image_size[0] - 100
        sample_char_width = font.getlength('M')
        if sample_char_width == 0:
            chars_per_line = int(max_pixel_width / (font_size * 0.5))
        else:
            chars_per_line = int(max_pixel_width / sample_char_width)

        chars_per_line = max(chars_per_line, 20)
        wrapped_text = textwrap.fill(data.topic, width=chars_per_line)

        bbox = draw.textbbox((0, 0), wrapped_text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        x = (image_size[0] - text_width) / 2
        y = (image_size[1] - text_height) / 2

        draw.text((x, y), wrapped_text, font=font, fill=text_color)
        text_image.save(temp_text_image_path)

        text_clip = ImageClip(temp_text_image_path, duration=duration).set_fps(24).set_position('center')

        video = CompositeVideoClip([background_clip, text_clip])
        video = video.set_audio(audio_clip)

        print(f"🎥 Writing final video to: {video_path}")
        video.write_videofile(video_path, codec="libx264", audio_codec="aac")

        # ✅ Cleanup temp files
        if os.path.exists(audio_path):
            os.remove(audio_path)
        if os.path.exists(temp_text_image_path):
            os.remove(temp_text_image_path)

        print(f"✅ Video successfully created and saved: {video_path}")
        return {
            "script": full_script,
            "video_id": new_video.id,
            "video_path": video_path
        }

    except Exception as e:
        print("❌ Error while generating video:", str(e))
        raise HTTPException(status_code=500, detail=f"Error generating video: {str(e)}")
