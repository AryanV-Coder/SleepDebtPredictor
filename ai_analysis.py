import google.generativeai as genai
from dotenv import load_dotenv
import os
import json
import re
# from blink_counter import count_blinks_in_video

# Load environment variables
load_dotenv()

# Configure Gemini AI
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-2.5-flash")


def ai_analysis(encoded_video):
    """
    Analyze video for sleep debt using Gemini AI
    
    Args:
        encoded_video (str): Base64 encoded video data
        
    Returns:
        dict: Parsed JSON response from AI model
    """
    # blink_count = count_blinks_in_video(encoded_video)

    # System prompt for sleep analysis
    system_prompt = """
    Analyze the provided 15-second video of a human subject and extract the following visual fatigue features:

    1. eye_redness — Score the visible redness in the sclera (white region of both eyes) on a scale from 0 to 10, where:
        - 0 = no redness (clear white),
        - 10 = extremely red and bloodshot.
        Use both color intensity and blood vessel prominence to determine the score. Average both eyes.

    2. dark_circles — Score the visibility of dark circles under the eyes on a scale from 0 to 10, where:
        - 0 = no visible darkening or puffiness,
        - 10 = extremely pronounced darkness and swelling.
        Analyze the under-eye region's shadow, color deviation from adjacent skin, and depth.

    3. yawn_count — Count the number of visible yawns. A yawn is defined as an open-mouth facial gesture     
    
    4. sleep_debt — Based on the above four indicators (eye_redness, dark_circles, yawn_count), 
        estimate the number of additional hours of sleep the person needs. This should be a realistic number 
        (e.g., between 0 and 10), derived from visual signs of sleep deprivation. number 
        (e.g., between 0 and 10), derived from visual signs of sleep deprivation.

    Return the output <n st>ictly this JSON format, with no extra text or metadata:

    {
      "eye_redness": <0–10>,
      "dark_circles": <0–10>,
      "yawn_count": <integer>,
      "sleep_debt": <integer>
    }

    ⚠️ Edge Cases Handling:
    - If no human face is detected in the video for at least 50% of the frames, return the following exact JSON:
    {
      "eye_redness": 0,
      "dark_circles": 0,
      "yawn_count": 0,
      "sleep_debt": 0
    }
    - If the eyes or mouth are not clearly visible due to obstruction, darkness, or motion blur, 
      estimate only the features you can confidently detect and return 0 for the rest.

    ❗Important: Do not include any conversation, explanation, or text outside the JSON block.
    """
    
    # Construct the prompt for Gemini AI
    prompt = [
        {
            "role": "user",
            "parts": [
                {
                    "text": system_prompt
                }
            ]
        },
        {
            "role": "user",
            "parts": [
                {
                    "mime_type": "video/webm",
                    "data": encoded_video  # Base64 video string
                }
            ]
        }
    ]
    
    try:
        # Generate AI response
        response = model.generate_content(prompt)
        response_text = response.text

        print(response_text)
        
        # Parse JSON response
        parsed_response = parse_json_response(response_text)

        return parsed_response
        
    except Exception as e:
        print(f"Error in AI analysis: {str(e)}")
        # Return error response as dictionary
        return {
            "eye_redness": 0,
            "dark_circles": 0,
            "yawn_count": 0,
            "sleep_debt": 0,
        }


def parse_json_response(response_text):
    """
    Parse JSON from AI response text, handling potential formatting issues
    
    Args:
        response_text (str): Raw response from AI
        
    Returns:
        dict: Parsed JSON data
    """
    try:
        # Try direct JSON parsing first
        return json.loads(response_text)
        
    except json.JSONDecodeError:
        try:
            # Extract JSON from text using regex (in case AI adds extra text)
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                json_str = json_match.group()
                return json.loads(json_str)
            else:
                raise ValueError("No JSON found in response")
                
        except (json.JSONDecodeError, ValueError) as e:
            print(f"Failed to parse JSON response: {str(e)}")
            print(f"Raw response: {response_text}")
            
            # Return default error response
            return {
                "eye_redness": 0,
                "dark_circles": 0,
                "yawn_count": 0,
                "sleep_debt": 0,
            }