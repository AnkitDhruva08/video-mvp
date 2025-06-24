# from fastapi import APIRouter, HTTPException
# from pydantic import BaseModel
# import os
# from openai import OpenAI  

# router = APIRouter()

# client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))  

# class TopicRequest(BaseModel):
#     topic: str

# @router.post("/generate-script")
# async def generate_script(data: TopicRequest):
#     try:
#         prompt = f"Write a short engaging script (50-100 words) for a video on: {data.topic}"
#         response = client.chat.completions.create(
#             model="gpt-3.5-turbo",
#             messages=[{"role": "user", "content": prompt}]
#         )
#         script = response.choices[0].message.content
#         return {"script": script}
#     except Exception as e:
#         print("Error calling OpenAI API:", str(e))
#         raise HTTPException(status_code=500, detail=str(e))
