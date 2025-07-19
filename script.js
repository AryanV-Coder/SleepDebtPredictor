// DOM Elements
const startBtn = document.getElementById('startBtn');
const videoElement = document.getElementById('videoElement');
const videoOverlay = document.getElementById('videoOverlay');
const statusMessage = document.getElementById('statusMessage');
const resultText = document.getElementById('resultText');
const timer = document.getElementById('timer');
const responseText = document.getElementById('responseText');

// Global Variables
let mediaRecorder;
let recordedChunks = [];
let stream;
let isRecording = false;
let countdown;
let timeLeft = 10;

// FastAPI Configuration
const API_BASE_URL = 'https://sleepdebtpredictor.onrender.com' ;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔄 Page loaded - initializing...');
    if (checkRequiredElements()) {
        // ✅ Don't initialize camera on page load - only when Start is pressed
        setupEventListeners();
        initializeUI();
        // ✅ Restore previous response from localStorage
        restoreResponseFromStorage();
        // ✅ Protect response text from being cleared
        protectResponseText();
    } else {
        console.error('❌ Required HTML elements not found');
    }
});

// Check if all required elements exist
function checkRequiredElements() {
    const requiredElements = [
        'startBtn', 'videoElement', 'videoOverlay', 
        'statusMessage', 'timer', 'responseText'
    ];
    
    const missingElements = requiredElements.filter(id => !document.getElementById(id));
    
    if (missingElements.length > 0) {
        console.error('❌ Missing elements:', missingElements);
        return false;
    }
    
    return true;
}

// 🎯 ONLY INITIAL SETUP - NO RESET LOGIC
function initializeUI() {
    console.log('🎯 Initial UI setup only - no reset logic');
    
    // Only set initial hidden states
    if (statusMessage) statusMessage.style.display = 'none';
    if (resultText) resultText.style.display = 'none';
    
    // Show overlay initially (camera will hide it if permission granted)
    if (videoOverlay) videoOverlay.classList.remove('hidden');
    if (videoElement) videoElement.style.display = 'none';
    
    console.log('✅ Initial UI setup complete');
}

// Setup event listeners
function setupEventListeners() {
    if (startBtn) {
        startBtn.addEventListener('click', startAnalysis);
        console.log('✅ Event listeners setup');
    }
}

// Initialize camera - only called when Start button is pressed
async function initializeCamera() {
    console.log('🎥 Starting camera when Start button pressed...');
    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 640, height: 480 },
            audio: false
        });
        
        if (videoElement) {
            videoElement.srcObject = stream;
            // ✅ Show video immediately when camera starts
            videoElement.style.display = 'block';
        }
        
        // ✅ Hide overlay when camera is active
        if (videoOverlay) {
            videoOverlay.classList.add('hidden');
        }
        
        console.log('✅ Camera started and visible');
        return true;
        
    } catch (err) {
        console.error('❌ Camera access denied:', err);
        showStatus('Camera access denied. Please allow camera permissions.', 'error');
        
        // Show overlay when camera fails
        if (videoOverlay) videoOverlay.classList.remove('hidden');
        if (videoElement) videoElement.style.display = 'none';
        return false;
    }
}

// 🚨 THE ONLY PLACE WHERE UI GETS RESET - WHEN START BUTTON IS PRESSED
async function startAnalysis() {
    console.log('🚨 START BUTTON PRESSED - Starting camera and recording');
    
    // Prevent multiple recordings
    if (isRecording) {
        console.log('⚠️ Already recording - ignoring click');
        return;
    }

    // 🔄 RESET UI FOR NEW ANALYSIS - ONLY HERE!
    console.log('🔄 Resetting UI for new analysis...');
    resetUIForNewAnalysis();

    // ✅ Initialize camera when Start is pressed
    console.log('🎥 Starting camera...');
    const cameraReady = await initializeCamera();
    if (!cameraReady) {
        showStatus('Camera not available', 'error');
        // Re-enable start button on camera failure
        if (startBtn) {
            startBtn.disabled = false;
            startBtn.textContent = 'Start';
        }
        return;
    }

    try {
        console.log('🎬 Starting recording...');
        
        // Setup recording
        recordedChunks = [];
        mediaRecorder = new MediaRecorder(stream, {
            mimeType: 'video/webm;codecs=vp9'
        });

        mediaRecorder.ondataavailable = function(event) {
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };

        mediaRecorder.onstop = async function() {
            console.log('🎬 Recording stopped - sending to API');
            const blob = new Blob(recordedChunks, { type: 'video/webm' });
            await sendVideoToAPI(blob);
        };

        // Start recording
        mediaRecorder.start();
        isRecording = true;

        // Update UI for recording
        updateUIForRecording();

        // Start countdown
        startCountdown();

    } catch (err) {
        console.error('❌ Error starting recording:', err);
        showStatus('Error starting recording', 'error');
        
        // Reset button on error
        if (startBtn) {
            startBtn.disabled = false;
            startBtn.textContent = 'Start';
        }
        isRecording = false;
        clearInterval(countdown);
    }
}

// 🔄 RESET UI FOR NEW ANALYSIS - ONLY CALLED FROM START BUTTON
function resetUIForNewAnalysis() {
    console.log('🔄 RESETTING UI - called only from Start button');
    
    // Reset button
    if (startBtn) {
        startBtn.disabled = false;
        startBtn.textContent = 'Start';
    }
    
    // Hide timer
    if (timer) {
        timer.style.display = 'none';
        timer.classList.remove('recording');
    }
    
    // Hide results
    if (resultText) {
        resultText.style.display = 'none';
        resultText.classList.remove('show');
    }
    
    // Clear response text AND localStorage
    if (responseText) {
        responseText.value = '';
        // Clear from localStorage when starting new analysis
        localStorage.removeItem('sleepAnalysisResponse');
    }
    
    // Reset video section
    const videoSection = document.querySelector('.video-section');
    if (videoSection) {
        videoSection.classList.remove('recording');
    }
    
    // ✅ Stop existing camera stream and show overlay
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
    if (videoElement) {
        videoElement.style.display = 'none';
        videoElement.srcObject = null;
    }
    if (videoOverlay) {
        videoOverlay.classList.remove('hidden');
    }
    
    // Reset timer value
    timeLeft = 10;
    
    // Hide status
    hideStatus();
    
    console.log('✅ UI reset complete - overlay visible, camera stopped');
}

// Update UI for recording
function updateUIForRecording() {
    console.log('🎬 Updating UI for recording');
    
    // Update button
    if (startBtn) {
        startBtn.disabled = true;
        startBtn.textContent = 'Recording...';
    }
    
    // Add recording effects
    const videoSection = document.querySelector('.video-section');
    if (videoSection) {
        videoSection.classList.add('recording');
    }
    
    // Show timer
    if (timer) {
        timer.style.display = 'flex';
        timer.classList.add('recording');
        timer.textContent = '10';
    }
    
    showStatus('Recording in progress... Please stay in frame', 'recording');
    
    console.log('✅ Recording UI updated');
}

// Countdown timer
function startCountdown() {
    console.log('⏱️ Starting countdown timer');
    timeLeft = 10;
    if (timer) timer.textContent = timeLeft;
    
    countdown = setInterval(() => {
        timeLeft--;
        if (timer) timer.textContent = timeLeft;
        
        if (timeLeft <= 0) {
            console.log('⏰ Timer reached 0 - stopping analysis');
            stopAnalysis();
        }
    }, 1000);
}

// 🛑 STOP ANALYSIS - ABSOLUTELY NO UI RESET HERE
function stopAnalysis() {
    console.log('🛑 Stopping analysis - NO UI RESET ALLOWED HERE');
    
    // Stop timer
    clearInterval(countdown);
    
    // Stop recording
    if (mediaRecorder && isRecording) {
        mediaRecorder.stop();
        isRecording = false;
        console.log('🎬 MediaRecorder stopped');
    }
    
    // Show processing status - NO RESET
    showStatus('Video Data Sent Successfully to the model', 'success');
    
    // Remove recording effects but keep everything else
    const videoSection = document.querySelector('.video-section');
    if (videoSection) {
        videoSection.classList.remove('recording');
    }
    
    // Keep timer visible at "0" - NO HIDING
    if (timer) {
        timer.textContent = '0';
        timer.classList.remove('recording');
        // ✅ timer.style.display stays 'flex' - VISIBLE
    }
    
    // 🚫 NO UI RESET - NOTHING GETS HIDDEN OR CLEARED
    console.log('✅ Analysis stopped - UI preserved, waiting for results');
}

// 📡 SEND VIDEO TO API - NO UI RESET
async function sendVideoToAPI(videoBlob) {
    console.log('📡 Sending video to API - NO UI RESET');
    
    try {
        showStatus('Processing video...', 'recording');
        
        const formData = new FormData();
        formData.append('video', videoBlob, 'sleep_analysis.webm');
        
        const response = await fetch(`${API_BASE_URL}/analyze-sleep`, {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ API Response received:', result);
            
            // Display results - NO RESET
            let resultsText = '';
            if (result.sleep_debt) {
                resultsText = result.sleep_debt;
            } else if (result.message) {
                resultsText = result.message;
            } else if (result.results) {
                resultsText = result.results;
            } else {
                resultsText = 'Analysis completed successfully 🎉';
            }
            
            displayResults(resultsText);
            
            // Only enable start button - NO OTHER CHANGES
            if (startBtn) {
                startBtn.disabled = false;
                startBtn.textContent = 'Start';
            }
            
        } else {
            console.error('❌ API Error:', response.statusText);
            showStatus('Error processing video', 'error');
            displayResults('Error: Could not process video');
            
            // Enable start button after error
            if (startBtn) {
                startBtn.disabled = false;
                startBtn.textContent = 'Start';
            }
        }
        
    } catch (err) {
        console.error('❌ Network error:', err);
        showStatus('Network error occurred', 'error');
        displayResults('Error: Network connection failed');
        
        // Enable start button after error
        if (startBtn) {
            startBtn.disabled = false;
            startBtn.textContent = 'Start';
        }
    }
}

// 📋 DISPLAY RESULTS - ABSOLUTELY NO RESET LOGIC
function displayResults(resultsText) {
    console.log('📋 Displaying results - NO RESET LOGIC:', resultsText);
    
    // Update response text area
    if (responseText) {
        responseText.value = resultsText;
        // ✅ Save to localStorage to persist across reloads
        localStorage.setItem('sleepAnalysisResponse', resultsText);
        localStorage.setItem('sleepAnalysisTimestamp', Date.now().toString());
    }
    
    // Update result text display
    if (resultText) {
        resultText.textContent = resultsText;
        resultText.classList.add('show');
        resultText.style.display = 'block';
    }
    
    // Show success status
    showStatus('Analysis completed!', 'success');
    
    // Keep timer visible at "0"
    if (timer) {
        timer.textContent = '0';
        timer.style.display = 'flex';
    }
    
    // Keep camera preview visible
    if (videoElement) {
        videoElement.style.display = 'block';
    }
    
    console.log('✅ Results displayed - everything stays visible until Start pressed');
}

// Show status message
function showStatus(message, type = 'ready') {
    if (statusMessage) {
        statusMessage.textContent = message;
        statusMessage.className = `status-message ${type} show`;
        statusMessage.style.display = 'block';
    }
}

// Hide status message
function hideStatus() {
    if (statusMessage) {
        statusMessage.classList.remove('show');
        setTimeout(() => {
            statusMessage.style.display = 'none';
        }, 300);
    }
}

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
    console.log('🧹 Page unloading - cleaning up');
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
    if (countdown) {
        clearInterval(countdown);
    }
});

// Global error handler
window.addEventListener('error', function(err) {
    console.error('🚨 Global error:', err);
    showStatus('An error occurred. Please refresh the page.', 'error');
});

// ✅ NEW: Restore response from localStorage on page load
function restoreResponseFromStorage() {
    const savedResponse = localStorage.getItem('sleepAnalysisResponse');
    const savedTimestamp = localStorage.getItem('sleepAnalysisTimestamp');
    
    if (savedResponse) {
        console.log('🔄 Restoring previous response from localStorage');
        
        // Check if response is less than 24 hours old
        const timestamp = parseInt(savedTimestamp) || 0;
        const now = Date.now();
        const hoursDiff = (now - timestamp) / (1000 * 60 * 60);
        
        if (hoursDiff < 24) {
            if (responseText) {
                responseText.value = savedResponse;
            }
            if (resultText) {
                resultText.textContent = savedResponse;
                resultText.classList.add('show');
                resultText.style.display = 'block';
            }
            console.log('✅ Previous response restored successfully');
        } else {
            // Clear old response
            localStorage.removeItem('sleepAnalysisResponse');
            localStorage.removeItem('sleepAnalysisTimestamp');
            console.log('🗑️ Old response cleared (>24 hours)');
        }
    }
}

// ✅ NEW: Prevent any accidental clearing of response text
function protectResponseText() {
    if (responseText) {
        // Check localStorage availability (for privacy/incognito mode)
        try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
        } catch (e) {
            console.warn('⚠️ localStorage not available - response won\'t persist across reloads');
            return;
        }
        
        // Create a MutationObserver to watch for changes
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                // If value gets cleared unexpectedly, restore it
                if (responseText.value === '' || responseText.value === 'Model Response will be shown here') {
                    const savedResponse = localStorage.getItem('sleepAnalysisResponse');
                    if (savedResponse) {
                        console.log('🛡️ Restoring cleared response text');
                        responseText.value = savedResponse;
                    }
                }
            });
        });
        
        // Watch for attribute changes on the textarea
        observer.observe(responseText, {
            attributes: true,
            attributeOldValue: true,
            attributeFilter: ['value']
        });
        
        // Also listen for input events
        responseText.addEventListener('input', function() {
            if (this.value === '' || this.value === 'Model Response will be shown here') {
                const savedResponse = localStorage.getItem('sleepAnalysisResponse');
                if (savedResponse) {
                    console.log('🛡️ Restoring cleared response text via input event');
                    this.value = savedResponse;
                }
            }
        });
    }
}