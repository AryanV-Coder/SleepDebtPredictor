from fastapi import FastAPI, UploadFile, HTTPException
import os
import base64
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware
from ai_analysis import ai_analysis, ai_message
from google_sheets import save_to_google_sheet
from model_training.model import predict_sleep_debt

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post('/analyze-sleep')
async def analyse_sleep(video: UploadFile):
    try:     
        # Create directory
        os.makedirs("uploaded_videos", exist_ok=True)
        
        # Generate timestamp-based filename
        timestamp = datetime.now().strftime("%H%M%S_%d%m%Y")
        filename = f"{timestamp}.webm"
        video_file_path = f"uploaded_videos/{filename}"
        
        # Save video file
        contents = await video.read()
        
        with open(video_file_path, "wb") as file:
            file.write(contents)
        
        # Read the binary data and encode to base64
        with open(video_file_path, 'rb') as file:
            encoded_video = base64.b64encode(file.read()).decode('utf-8')
        
        ai_response = ai_analysis(encoded_video)
        print(f"AI Response before model prediction: {ai_response}")

        sleep_debt = predict_sleep_debt(eye_redness = ai_response['eye_redness'],dark_circles = ai_response['dark_circles'],yawn_count = ai_response['yawn_count'])
        print(f"Sleep Debt by Our Model : {sleep_debt}")

        ai_response['sleep_debt'] = sleep_debt
        print(f"AI Response after model prediction: {ai_response}")

        save_to_google_sheet(ai_response)
        
        response_text = f"You need to sleep {sleep_debt} hours more to achieve proper sleep health."
        ai_message_response = ai_message(sleep_debt)
        eye_redness = f"Eye Redness : {ai_response['eye_redness']}"
        dark_circles = f"Dark Circles : {ai_response['dark_circles']}"
        yawn_count = f"Yawn Count : {ai_response['yawn_count']}"


        response = {
            "eye_redness": eye_redness,
            "dark_circles": dark_circles,
            "yawn_count": yawn_count,
            "sleep_debt": response_text,
            "message" : ai_message_response
        }

        return response
        
    except Exception as e:
        print(f"Error in analyze_sleep: {str(e)}")
        print(f"Error type: {type(e).__name__}")
        import traceback
        traceback.print_exc()
        
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
