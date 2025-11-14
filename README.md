# Sleep Debt Predictor

A web application that analyzes sleep debt using facial features detection and AI analysis.

## 🔗 Live Demo

Check out the live application: [https://sleep-debt-predictor.vercel.app/](https://sleep-debt-predictor.vercel.app/)

## Features

- Real-time video recording using webcam
- Facial landmark detection using dlib
- Blink and yawn detection
- AI-powered sleep debt analysis using Google Gemini
- Text-to-Speech (TTS) feedback in browser using Web Speech API
- Google Sheets integration for data storage

## Local Development

### Prerequisites

- Python 3.8+
- Webcam access
- Google API credentials

### Setup

1. Clone the repository:
```bash
git clone https://github.com/AryanV-Coder/SleepDebtPredictor.git
cd SleepDebtPredictor
```

2. Create virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Download required model files:
```bash
python3 download_model.py
```

5. Set up environment variables:
Create a `.env` file with:
```
GEMINI_API_KEY=your_gemini_api_key_here
```

6. Add Google Sheets credentials:
Place your Google service account JSON file in the project root

7. Run the application:
```bash
uvicorn main:app --reload
```

8. Open `index.html` in your browser

## Deployment on Render

### Step 1: Prepare Repository

1. Ensure `.gitignore` excludes large files:
   - `venv/` directory
   - `*.dat` model files
   - `*.json` credential files

2. Commit your code:
```bash
git add .
git commit -m "Add deployment configuration"
git push origin main
```

### Step 2: Render Configuration

1. **Service Type**: Web Service
2. **Build Command**: 
```bash
pip install -r requirements.txt && python3 download_model.py
```
3. **Start Command**:
```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```

### Step 3: Environment Variables

Set these environment variables in Render:

- `GEMINI_API_KEY`: Your Google Gemini API key
- `PYTHON_VERSION`: 3.11.0 (or your preferred version)

### Step 4: Add Secrets

- Upload your Google service account JSON as a secret file
- Update the file path in your code to match Render's file structure

## File Structure

```
SleepDebtPredictor/
├── main.py                 # FastAPI backend
├── ai_analysis.py          # AI analysis logic
├── blink_counter.py        # Blink detection
├── google_sheets.py        # Google Sheets integration
├── download_model.py       # Model download script
├── start.sh               # Deployment startup script
├── requirements.txt       # Python dependencies
├── index.html            # Frontend HTML
├── script.js             # Frontend JavaScript
├── styles.css            # Frontend styling
├── .gitignore            # Git ignore rules
└── README.md             # This file
```

## Model Files

The application uses the dlib 68-point facial landmark predictor:
- File: `shape_predictor_68_face_landmarks.dat`
- Size: ~95MB
- Downloaded automatically during deployment
- Source: http://dlib.net/files/shape_predictor_68_face_landmarks.dat.bz2

## API Endpoints

- `POST /analyze-sleep`: Upload video for sleep debt analysis
- Returns JSON with sleep debt analysis results

## Text-to-Speech (TTS) Details

- The web app uses the browser's Web Speech API for TTS feedback.
- TTS speed and pitch are set high for clarity and energy.
- You can test available voices in the browser console using `testVoice('VoiceName')`.

## Technologies Used

- **Backend**: FastAPI, Python
- **Frontend**: HTML, CSS, JavaScript (with Web Speech API for TTS)
- **AI**: Google Gemini API
- **Computer Vision**: OpenCV, dlib
- **Storage**: Google Sheets API
- **Deployment**: Render

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request
