#!/usr/bin/env python3
"""
Download required model files for the Sleep Debt Predictor
This script downloads the dlib face landmark predictor model
"""

import os
import urllib.request
import bz2
import shutil

def download_face_landmarks_model():
    """Download the dlib 68-point face landmark predictor model"""
    
    model_url = "http://dlib.net/files/shape_predictor_68_face_landmarks.dat.bz2"
    model_filename = "shape_predictor_68_face_landmarks.dat"
    compressed_filename = "shape_predictor_68_face_landmarks.dat.bz2"
    
    # Check if model already exists
    if os.path.exists(model_filename):
        print(f"✅ {model_filename} already exists, skipping download")
        return True
    
    try:
        print(f"📥 Downloading {model_filename}...")
        print(f"🔗 URL: {model_url}")
        
        # Download the compressed file
        urllib.request.urlretrieve(model_url, compressed_filename)
        print(f"✅ Downloaded {compressed_filename}")
        
        # Extract the compressed file
        print(f"📦 Extracting {compressed_filename}...")
        with bz2.BZ2File(compressed_filename, 'rb') as f_in:
            with open(model_filename, 'wb') as f_out:
                shutil.copyfileobj(f_in, f_out)
        
        # Remove the compressed file
        os.remove(compressed_filename)
        print(f"✅ Extracted and cleaned up")
        print(f"📁 Model saved as: {model_filename}")
        
        # Verify file size
        file_size = os.path.getsize(model_filename)
        print(f"📊 File size: {file_size / (1024*1024):.1f} MB")
        
        return True
        
    except Exception as e:
        print(f"❌ Error downloading model: {str(e)}")
        # Clean up partial files
        for temp_file in [compressed_filename, model_filename]:
            if os.path.exists(temp_file):
                os.remove(temp_file)
        return False

if __name__ == "__main__":
    print("🚀 Starting model download...")
    success = download_face_landmarks_model()
    
    if success:
        print("✅ All models downloaded successfully!")
    else:
        print("❌ Model download failed!")
        exit(1)
