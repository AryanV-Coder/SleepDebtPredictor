from fastapi import FastAPI, UploadFile, HTTPException
import os
import base64
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware
from ai_analysis import ai_analysis
from google_sheets import save_to_google_sheet

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
        save_to_google_sheet(ai_response)

        # Your ML processing code here...
        
        # Return successful response
        response = {
            'sleep_debt': 'Thank You for your input in training this model.',  # Your ML result here
        }
        
        return response
        
    except Exception as e:
        print(f"Error in analyze_sleep: {str(e)}")
        print(f"Error type: {type(e).__name__}")
        import traceback
        traceback.print_exc()
        
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
