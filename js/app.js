// MeHelper App.js

// ============================= 
// SPLASH SCREEN CONTROLLER
// ============================= 

// Splash screen timing and control
const SPLASH_DURATION = 4000; // 4 seconds

// Initialize splash screen when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    initializeSplashScreen();
});

function initializeSplashScreen() {
    const splashScreen = document.getElementById('splash-screen');
    const mainApp = document.getElementById('main-app');
    
    // Ensure splash screen is visible and main app is hidden initially
    if (splashScreen && mainApp) {
        splashScreen.classList.remove('hidden');
        mainApp.classList.add('hidden');
        
        // Set timeout to transition from splash to main app
        setTimeout(() => {
            transitionToMainApp();
        }, SPLASH_DURATION);
        
        // Preload main app content earlier
        setTimeout(() => {
            initializeMainApp();
        }, 2000); // Initialize 2 seconds early
    } else {
        // Fallback: if splash screen elements don't exist, show main app immediately
        console.warn('Splash screen elements not found, showing main app immediately');
        if (mainApp) {
            mainApp.classList.remove('hidden');
            mainApp.classList.add('visible');
        }
        initializeMainApp();
    }
}

function transitionToMainApp() {
    const splashScreen = document.getElementById('splash-screen');
    const mainApp = document.getElementById('main-app');
    
    if (splashScreen && mainApp) {
        // Start the transition
        mainApp.classList.remove('hidden');
        
        // Use shorter delay for smoother transition
        setTimeout(() => {
            splashScreen.classList.add('hidden');
            mainApp.classList.add('visible');
        }, 100); // Very short delay
    }
}

function initializeMainApp() {
    // Load saved preferences
    loadPreferences();
    
    // Initialize event listeners
    initEventListeners();
    
    // Initialize chips
    initChips();
    
    // Load previous scans
    loadPreviousScans();
    
    // Navbar event listeners
    const menuIcon = document.getElementById('menu-icon');
    const closeNavbar = document.getElementById('close-navbar');
    const overlay = document.getElementById('overlay');
    
    if (menuIcon) menuIcon.addEventListener('click', openNavbar);
    if (closeNavbar) closeNavbar.addEventListener('click', closeNavbarFunc);
    if (overlay) overlay.addEventListener('click', closeNavbarFunc);
    
    // Resources dialog event listeners
    const resourcesBtn = document.getElementById('resources-btn');
    const closeDialog = document.getElementById('close-dialog');
    
    if (resourcesBtn) resourcesBtn.addEventListener('click', openResourcesDialog);
    if (closeDialog) closeDialog.addEventListener('click', closeResourcesDialog);
    
    // Location sharing functionality
    const sendLocationBtn = document.getElementById('send-location-btn');
    if (sendLocationBtn) {
        sendLocationBtn.addEventListener('click', shareLocation);
    }
    
    // Close delete buttons when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.history-item-menu') && !e.target.closest('.delete-button')) {
            document.querySelectorAll('.delete-button').forEach(btn => {
                btn.classList.remove('show');
            });
        }
    });
}

// ============================= 
// MAIN APPLICATION CODE
// ============================= 

// DOM References
// Language toggle and Emergency Mode constants removed
const startTriageBtn = document.getElementById('start-triage-btn');
const triageForm = document.getElementById('triage-form');
const imageInput = document.getElementById('image-input');
const imagePreview = document.getElementById('image-preview');
const resultCard = document.getElementById('result-card');
const riskBadge = document.getElementById('risk-badge');
const immediateStepsList = document.getElementById('immediate-steps-list');
const redFlagsList = document.getElementById('red-flags-list');
const seekHelpText = document.getElementById('seek-help-text');
const emergencyTips = document.getElementById('emergency-tips');
const offlineTipsList = document.getElementById('offline-tips-list');
const accordionItems = document.querySelectorAll('.accordion-item');

// New 8-Level Triage DOM References
const reassuranceLevel = document.getElementById('level-1-reassurance');
const assessmentBadge = document.getElementById('assessment-badge');
const conditionSeverity = document.getElementById('condition-severity');
const possibilitiesList = document.getElementById('possibilities-list');
const firstAidList = document.getElementById('first-aid-list');
const dangerLevel = document.getElementById('level-5-danger');
const dangerSignsList = document.getElementById('danger-signs-list');
const vitalsAnalysis = document.getElementById('vitals-analysis');
const summaryReport = document.getElementById('summary-report');
const nextActionRecommendation = document.getElementById('next-action-recommendation');

// Navbar References
const menuIcon = document.getElementById('menu-icon');
const navbar = document.getElementById('navbar');
const closeNavbar = document.getElementById('close-navbar');
const overlay = document.getElementById('overlay');
const historyList = document.getElementById('history-list');
const noHistoryText = document.getElementById('no-history-text');

// Resources Dialog References
const resourcesBtn = document.getElementById('resources-btn');
const resourcesDialog = document.getElementById('resources-dialog');
const closeDialog = document.getElementById('close-dialog');

// i18n Dictionary removed - Language switching functionality removed

// First Aid Guidance Content
const firstAidGuidance = {
    low: {
        immediateSteps: [
            'Rest and stay hydrated',
            'Monitor your symptoms',
            'Take over-the-counter pain relievers if needed',
            'Use cold or warm compresses for comfort'
        ],
        redFlags: [
            'Symptoms worsen significantly',
            'New symptoms develop',
            'Fever above 38°C (100.4°F) develops',
            'Symptoms persist for more than 7 days'
        ]
    },
    moderate: {
        immediateSteps: [
            'Rest in a comfortable position',
            'Stay hydrated with small, frequent sips of water',
            'Take appropriate medication if available',
            'Monitor temperature and other vital signs',
            'Avoid strenuous activity'
        ],
        redFlags: [
            'Difficulty breathing',
            'Chest pain or pressure',
            'Severe headache or confusion',
            'Inability to keep fluids down',
            'Fever above 39°C (102.2°F)'
        ]
    },
    high: {
        immediateSteps: [
            'Have someone stay with you if possible',
            'Rest in the most comfortable position',
            'Stay hydrated if able to drink',
            'Take medication only as prescribed',
            'Prepare to seek medical attention'
        ],
        redFlags: [
            'Difficulty breathing or shortness of breath',
            'Severe pain anywhere in the body',
            'Confusion or altered mental state',
            'Severe vomiting or diarrhea',
            'Loss of consciousness, even briefly'
        ]
    },
    emergency: {
        immediateSteps: [
            'Call emergency services immediately',
            'Do not eat or drink anything',
            'Lie down with feet elevated if feeling faint',
            'If breathing difficulty, sit upright',
            'If available, take prescribed emergency medication'
        ],
        redFlags: [
            'Loss of consciousness',
            'Not breathing or severe difficulty breathing',
            'Severe bleeding that cannot be stopped',
            'Chest pain radiating to arm or jaw',
            'Sudden severe headache with vomiting'
        ]
    }
};

// emergencyKeywords array definition
const emergencyKeywords = [
    'chest pain', 'severe bleeding', 'bleeding', 'blood', 'fainting', 'fainted', 'unconscious',
    'shortness of breath', 'can\'t breathe', 'difficulty breathing', 'stroke', 'heart attack',
    'seizure', 'convulsion', 'anaphylaxis', 'allergic reaction', 'poisoning', 'overdose',
    'suicide', 'drowning', 'choking', 'head injury', 'neck injury', 'spine injury', 'paralysis'
];

// Note: Main app initialization is now handled by the splash screen controller above

// Load preferences from localStorage - simplified without language and emergency mode
function loadPreferences() {
    // Preferences loading simplified - removed language and emergency mode functionality
}

// Initialize event listeners
function initEventListeners() {
    // Language toggle and Emergency mode toggle removed
    
    // Start triage button
    startTriageBtn.addEventListener('click', () => {
        document.getElementById('triage').scrollIntoView({ behavior: 'smooth' });
    });
    
    // Triage form submission
    triageForm.addEventListener('submit', (e) => {
        e.preventDefault();
        analyzeTriage();
    });
    
    // New Scan button - Reset form and show triage section
    const newScanBtn = document.getElementById('new-scan-btn');
    if (newScanBtn) {
        newScanBtn.addEventListener('click', () => {
            resetTriageForm();
        });
    }
    
    // Image upload preview
    imageInput.addEventListener('change', handleImageUpload);
    
    // Audio reading functionality
    initAudioButtons();
    
    // Accordion functionality
    accordionItems.forEach(item => {
        const header = item.querySelector('.accordion-header');
        header.addEventListener('click', () => {
            toggleAccordion(item);
        });
        
        // Add keyboard accessibility
        header.setAttribute('tabindex', '0');
        header.setAttribute('aria-expanded', 'false');
        header.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleAccordion(item);
            } else if (e.key === 'Escape') {
                if (item.classList.contains('active')) {
                    toggleAccordion(item);
                }
            }
        });
    });
}

// Initialize symptom chips
function initChips() {
    const chips = document.querySelectorAll('.chip');
    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            chip.classList.toggle('active');
        });
        
        // Add keyboard accessibility
        chip.setAttribute('tabindex', '0');
        chip.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                chip.classList.toggle('active');
            }
        });
    });
}

// setLanguage function removed - Language switching functionality removed

// toggleEmergencyMode function removed - Emergency Mode functionality removed

// Handle image upload preview
function handleImageUpload(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const img = document.createElement('img');
            img.src = event.target.result;
            imagePreview.innerHTML = '';
            imagePreview.appendChild(img);
        };
        reader.readAsDataURL(file);
    } else {
        imagePreview.innerHTML = '';
    }
}

// Toggle accordion items
function toggleAccordion(item) {
    const isActive = item.classList.contains('active');
    const header = item.querySelector('.accordion-header');
    
    // Close all accordions
    accordionItems.forEach(accordion => {
        accordion.classList.remove('active');
        accordion.querySelector('.accordion-header').setAttribute('aria-expanded', 'false');
    });
    
    // If the clicked item wasn't active, open it
    if (!isActive) {
        item.classList.add('active');
        header.setAttribute('aria-expanded', 'true');
    }
}

// Reset triage form and show it again
function resetTriageForm() {
    // Reset the form
    const form = document.getElementById('triage-form');
    if (form) {
        form.reset();
    }
    
    // Clear selected chips
    document.querySelectorAll('.chip.active').forEach(chip => {
        chip.classList.remove('active');
    });
    
    // Clear image preview
    const imagePreview = document.getElementById('image-preview');
    if (imagePreview) {
        imagePreview.innerHTML = '';
    }
    
    // Hide level 8 image analysis section
    const level8ImageAnalysis = document.getElementById('level-8-image-analysis');
    if (level8ImageAnalysis) {
        level8ImageAnalysis.classList.add('hidden');
    }
    
    // Show the triage form section again
    const triageCard = document.querySelector('.triage-card');
    if (triageCard) {
        triageCard.style.display = 'block';
    }
    
    // Hide the result card
    const resultCard = document.getElementById('result-card');
    if (resultCard) {
        resultCard.classList.add('hidden');
    }
    
    // Scroll to the triage form
    const triageSection = document.getElementById('triage');
    if (triageSection) {
        triageSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Analyze triage form data
async function analyzeTriage() {
    // Get form values
    const age = parseInt(document.getElementById('age').value) || 0;
    const sex = document.getElementById('sex').value;
    const symptomsText = document.getElementById('symptoms-text').value;
    const duration = document.getElementById('duration').value;
    const temperature = parseFloat(document.getElementById('temperature').value) || null;
    const heartRate = parseInt(document.getElementById('heart-rate').value) || null;
    const imageInput = document.getElementById('image-input');
    
    // Get selected symptom chips
    const selectedChips = [];
    document.querySelectorAll('.chip.active').forEach(chip => {
        selectedChips.push(chip.getAttribute('data-value'));
    });
    
    // Show loading state with circular spinner
    const analyzeBtn = document.getElementById('analyze-btn');
    const originalText = analyzeBtn.textContent;
    analyzeBtn.innerHTML = '<div class="btn-spinner"><div class="spinner"></div> Analyzing...</div>';
    analyzeBtn.disabled = true;

    // Show loading overlay
    showLoadingOverlay();

    let imageAnalysis = null;
    
    try {
        // First, analyze image if uploaded
        if (imageInput.files && imageInput.files.length > 0) {
            console.log('Image detected, analyzing...');
            
            // Update loading message
            updateLoadingMessage('Analyzing image with AI...');
            
            const imageFile = imageInput.files[0];
            const formData = new FormData();
            formData.append('image', imageFile);
            formData.append('prompt', 'What do you see in this medical image? Describe any symptoms, conditions, rashes, wounds, swelling, discoloration, or medical findings visible. Focus on medically relevant observations that could help with symptom assessment.');
            
            const imageResponse = await fetch('/api/analyze_image', {
                method: 'POST',
                body: formData
            });
            
            if (imageResponse.ok) {
                const imageResult = await imageResponse.json();
                if (imageResult.success) {
                    imageAnalysis = imageResult.analysis;
                    console.log('Image analysis successful:', imageAnalysis);
                } else {
                    console.warn('Image analysis failed:', imageResult.error);
                    if (imageResult.fallback_analysis) {
                        imageAnalysis = imageResult.fallback_analysis;
                    }
                }
            } else {
                console.warn('Image analysis request failed:', imageResponse.status);
            }
        }
        
        // Update loading message for symptom analysis
        updateLoadingMessage('Analyzing symptoms with GPT-OSS...');
        
        // Create comprehensive form data object for API
        const apiData = {
            age: age,
            sex: sex,
            symptoms: symptomsText + (selectedChips.length > 0 ? ' ' + selectedChips.join(', ') : ''),
            duration: duration,
            vitals: {
                temperature: temperature,
                heart_rate: heartRate
            }
        };
        
        // Add image analysis to the data if available
        if (imageAnalysis) {
            apiData.image_analysis = imageAnalysis;
            console.log('Adding image analysis to API data:', imageAnalysis.substring(0, 100) + '...');
        } else {
            console.log('No image analysis available to add to API data');
        }

        // Call the backend API for AI analysis (direct web interface)
        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(apiData)
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const result = await response.json();
        
        // Display results from AI analysis
        displayAIResults(result);
        
        // Ensure risk level is valid, fallback to calculated risk if undefined
        const validRiskLevel = result.risk_level || calculateRiskLevel(
            parseInt(document.getElementById('age').value) || 0,
            document.getElementById('symptoms-text').value,
            Array.from(document.querySelectorAll('.chip.active')).map(chip => chip.getAttribute('data-value')),
            document.getElementById('duration').value,
            parseFloat(document.getElementById('temperature').value) || 0,
            parseInt(document.getElementById('heart-rate').value) || 0
        );
        
        // Save scan to history with AI response and image analysis
        const scanData = {
            ...result,
            imageAnalysis: imageAnalysis
        };
        saveScanToHistory(validRiskLevel, scanData);
        
        // Debug: Check if we had image analysis to display
        console.log('Final result for display:', {
            hasImageAnalysis: !!imageAnalysis,
            imageAnalysisIncluded: result.image_analysis_included,
            imageFindings: result.image_findings
        });
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error analyzing symptoms. Please check your connection and try again.');
        
        // Do NOT use emulator/fallback analysis - only show error
        // The user should retry with proper internet connection
        
    } finally {
        // Hide loading overlay
        hideLoadingOverlay();
        analyzeBtn.textContent = originalText;
        analyzeBtn.disabled = false;
        
        // Safely handle result card visibility
        if (resultCard) {
            resultCard.classList.remove('hidden');
            resultCard.scrollIntoView({ behavior: 'smooth' });
            
            // Hide the triage form section when results are shown
            const triageCard = document.querySelector('.triage-card');
            if (triageCard) {
                triageCard.style.display = 'none';
            }
        }
    }
}

// Calculate risk level based on inputs
function calculateRiskLevel(age, symptomsText, selectedChips, duration, temperature, heartRate) {
    // Check for emergency keywords in symptoms text
    for (const keyword of emergencyKeywords) {
        if (symptomsText.includes(keyword)) {
            return 'emergency';
        }
    }
    
    // Initialize risk score
    let riskScore = 0;
    
    // Age factors
    if (age < 5 || age >= 65) {
        riskScore += 2;
    }
    
    // Temperature factors
    if (temperature >= 39) {
        riskScore += 2;
    } else if (temperature >= 38) {
        riskScore += 1;
    }
    
    // Heart rate factors
    if (heartRate > 120) {
        riskScore += 2;
    } else if (heartRate > 100) {
        riskScore += 1;
    }
    
    // Duration factors
    if (duration === 'more') {
        riskScore += 2;
    } else if (duration === '1-2weeks') {
        riskScore += 1;
    } else if (duration === '3-7days') {
        riskScore += 0.5;
    }
    
    // Symptom factors
    const highRiskSymptoms = ['chest-pain', 'breathing'];
    const moderateRiskSymptoms = ['fever', 'diarrhea', 'pain', 'anxiety', 'depression'];
    const lowRiskSymptoms = ['stress', 'other'];
    
    for (const symptom of selectedChips) {
        if (highRiskSymptoms.includes(symptom)) {
            riskScore += 2;
        } else if (moderateRiskSymptoms.includes(symptom)) {
            riskScore += 1;
        } else if (lowRiskSymptoms.includes(symptom)) {
            riskScore += 0.5;
        }
    }
    
    // Determine risk level based on score
    if (riskScore >= 5) {
        return 'high';
    } else if (riskScore >= 3) {
        return 'moderate';
    } else {
        return 'low';
    }
}

// Loading overlay functions
function showLoadingOverlay() {
    let overlay = document.getElementById('loading-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'loading-overlay';
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `
            <div class="loading-content">
                <div class="circular-spinner">
                    <div class="spinner-ring"></div>
                    <div class="spinner-ring"></div>
                    <div class="spinner-ring"></div>
                </div>
                <p id="loading-message">Analyzing your symptoms with AI...</p>
                <small id="loading-submessage">This may take a few moments</small>
            </div>
        `;
        document.body.appendChild(overlay);
    }
    overlay.classList.add('active');
}

function hideLoadingOverlay() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.classList.remove('active');
    }
}

function updateLoadingMessage(message, submessage = 'This may take a few moments') {
    const messageEl = document.getElementById('loading-message');
    const submessageEl = document.getElementById('loading-submessage');
    
    if (messageEl) {
        messageEl.textContent = message;
    }
    if (submessageEl) {
        submessageEl.textContent = submessage;
    }
}

// Display triage result for history items
function displayResult(scanId) {
    // Get the actual scan data from history
    const scans = JSON.parse(localStorage.getItem('mehelper-scans') || '[]');
    const scan = scans.find(s => s.id === scanId);
    
    if (!scan) {
        console.error('Scan not found in history');
        return;
    }
    
    // Create proper form data from scan
    const formData = {
        age: scan?.age || '',
        sex: scan?.sex || '',
        symptoms: scan?.symptoms || '',
        selectedSymptoms: scan?.selectedSymptoms || [],
        duration: scan?.duration || '',
        temperature: scan?.temperature || '',
        heartRate: scan?.heartRate || ''
    };
    
    // Safely handle result card visibility
    if (!resultCard) {
        console.error('Result card element not found');
        return;
    }
    
    // Show the result card if it's hidden
    if (resultCard.classList.contains('hidden')) {
        resultCard.classList.remove('hidden');
    }
    
    // Ensure riskLevel is defined, fallback to calculated risk if undefined
    const riskLevel = scan.riskLevel || (scan.aiResponse && scan.aiResponse.risk_level) || 'low';
    
    // Use the comprehensive triage display with actual scan data
    displayComprehensiveTriage(formData, riskLevel);
    
    // If AI response is saved, display it
    if (scan.aiResponse) {
        displayAIResults(scan.aiResponse);
    }
    
    // Emergency mode handling - map functionality removed
    
    // Show result card and scroll to it
    resultCard.classList.remove('hidden');
    resultCard.scrollIntoView({ behavior: 'smooth' });
    
    // Hide the triage form section when viewing previous results
    const triageCard = document.querySelector('.triage-card');
    if (triageCard) {
        triageCard.style.display = 'none';
    }
}

// Navbar Functions
function openNavbar() {
    navbar.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeNavbarFunc() {
    navbar.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
}

// Resources Dialog Functions
function openResourcesDialog() {
    resourcesDialog.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    closeNavbarFunc(); // Close navbar if open
}

function closeResourcesDialog() {
    resourcesDialog.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
}

// Location sharing functionality
function shareLocation() {
    const sendLocationBtn = document.getElementById('send-location-btn');
    
    if (!navigator.geolocation) {
        alert('Geolocation is not supported by this browser.');
        return;
    }
    
    // Show loading state
    sendLocationBtn.disabled = true;
    sendLocationBtn.innerHTML = '📍 Getting location...';
    
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const accuracy = position.coords.accuracy;
            
            // Reset button
            sendLocationBtn.disabled = false;
            sendLocationBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>Send My Location';
            
            // Create a shareable location message
            const locationMessage = `My current location: https://www.google.com/maps?q=${lat},${lng} (Accuracy: ~${Math.round(accuracy)}m)`;
            
            // Try to use Web Share API if available
            if (navigator.share) {
                navigator.share({
                    title: 'My Current Location - MeHelper',
                    text: 'I need medical assistance. Here is my current location:',
                    url: `https://www.google.com/maps?q=${lat},${lng}`
                }).catch(err => {
                    console.log('Error sharing:', err);
                    fallbackShare(locationMessage);
                });
            } else {
                fallbackShare(locationMessage);
            }
        },
        (error) => {
            // Reset button
            sendLocationBtn.disabled = false;
            sendLocationBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>Send My Location';
            
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    alert('Location access denied. Please enable location services and try again.');
                    break;
                case error.POSITION_UNAVAILABLE:
                    alert('Location information is unavailable.');
                    break;
                case error.TIMEOUT:
                    alert('Location request timed out.');
                    break;
                default:
                    alert('An unknown error occurred while retrieving location.');
                    break;
            }
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
        }
    );
}

function fallbackShare(locationMessage) {
    // Copy to clipboard as fallback
    if (navigator.clipboard) {
        navigator.clipboard.writeText(locationMessage).then(() => {
            alert('Location copied to clipboard! You can now paste and send it via your preferred messaging app.');
        }).catch(() => {
            // If clipboard fails, show the text for manual copy
            prompt('Copy this location to share:', locationMessage);
        });
    } else {
        // Fallback for older browsers
        prompt('Copy this location to share:', locationMessage);
    }
}

// Local Storage Functions for Scan History
function saveScanToHistory(riskLevel, aiResponse = null) {
    // Get form data directly from elements to ensure we get the values
    const age = document.getElementById('age').value;
    const sex = document.getElementById('sex').value;
    const symptoms = document.getElementById('symptoms-text').value;
    const duration = document.getElementById('duration').value;
    const temperature = document.getElementById('temperature').value;
    const heartRate = document.getElementById('heart-rate').value;
    
    // Get selected symptom chips
    const selectedChips = [];
    document.querySelectorAll('.chip.active').forEach(chip => {
        selectedChips.push(chip.getAttribute('data-value'));
    });
    
    // Create scan object
    const scan = {
        id: Date.now(),
        date: new Date().toISOString(),
        age,
        sex,
        symptoms,
        selectedSymptoms: selectedChips,
        duration,
        temperature,
        heartRate,
        riskLevel: riskLevel,
        guidance: firstAidGuidance[riskLevel],
        aiResponse: aiResponse
    };
    
    // Get existing scans or initialize empty array
    let scans = JSON.parse(localStorage.getItem('mehelper-scans') || '[]');
    
    // Check for duplicate scan based on timestamp (within 1 second) AND exact data match
    const isDuplicate = scans.some(existingScan => 
        Math.abs(new Date(existingScan.date) - new Date(scan.date)) < 1000 ||
        (existingScan.age === scan.age &&
         existingScan.sex === scan.sex &&
         existingScan.symptoms === scan.symptoms &&
         existingScan.riskLevel === scan.riskLevel &&
         existingScan.temperature === scan.temperature &&
         existingScan.heartRate === scan.heartRate)
    );
    
    // Only add if not a duplicate
    if (!isDuplicate) {
        // Add new scan to beginning of array
        scans.unshift(scan);
        
        // Limit to 10 most recent scans
        if (scans.length > 10) {
            scans = scans.slice(0, 10);
        }
        
        // Save to local storage
        localStorage.setItem('mehelper-scans', JSON.stringify(scans));
    }
    
    // Refresh the history list
    loadPreviousScans();
}

function loadPreviousScans() {
    // Get scans from local storage
    const scans = JSON.parse(localStorage.getItem('mehelper-scans') || '[]');
    
    // Clear history list
    historyList.innerHTML = '';
    
    // Show no history text if no scans
    if (scans.length === 0) {
        noHistoryText.classList.remove('hidden');
        return;
    }
    
    // Hide no history text
    noHistoryText.classList.add('hidden');
    
    // Add scans to history list
    scans.forEach(scan => {
        const historyItem = createHistoryItem(scan);
        historyList.appendChild(historyItem);
    });
}

function createHistoryItem(scan) {
    const item = document.createElement('div');
    item.className = 'history-item';
    item.dataset.id = scan.id;
    
    // Format date
    const date = new Date(scan.date);
    const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
    
    // Handle empty values with default display text
    
    // Check if symptoms is undefined, null, empty string, or just whitespace
    const hasSymptoms = scan.symptoms && typeof scan.symptoms === 'string' && scan.symptoms.trim() !== '';
    const symptomsText = hasSymptoms ? scan.symptoms : 'No symptoms described';
    
    // Check if age and sex are provided
    const ageText = scan.age !== undefined && scan.age !== null && scan.age.toString().trim() !== '' ? scan.age : '';
    
    // Get the correct sex text directly
    let sexText = '';
    if (scan.sex !== undefined && scan.sex !== null && scan.sex.trim() !== '') {
        sexText = scan.sex;
    }
    
    // Use default text if both age and sex are empty
    const hasDetails = (ageText !== '' || sexText !== '');
    // Format the details text to show age and sex when available
    let detailsText;
    if (hasDetails) {
        if (ageText && sexText) {
            detailsText = `${ageText}, ${sexText}`;
        } else {
            detailsText = ageText || sexText;
        }
    } else {
        detailsText = 'No details provided';
    }
    
    // Create item content with explicit default text handling
    const symptomDiv = document.createElement('div');
    symptomDiv.className = 'history-item-symptoms';
    symptomDiv.textContent = symptomsText;
    
    const detailDiv = document.createElement('div');
    detailDiv.className = 'history-item-details';
    // Force the details text to be set directly
    if (hasDetails) {
        if (ageText && sexText) {
            detailDiv.textContent = `${ageText}, ${sexText}`;
        } else {
            detailDiv.textContent = ageText || sexText;
        }
    } else {
        detailDiv.textContent = 'No details provided';
    }
    
    const riskLabels = {
        'low': 'Low Risk',
        'moderate': 'Moderate Risk',
        'high': 'High Risk',
        'emergency': 'Emergency'
    };
    
    item.innerHTML = `
        <div class="history-item-header">
            <span class="history-item-date">${formattedDate}</span>
            <span class="history-item-risk badge badge-${scan.riskLevel}">${riskLabels[scan.riskLevel] || scan.riskLevel}</span>
        </div>
    `;
    
    // Create 3-dots menu button
    const menuButton = document.createElement('div');
    menuButton.className = 'history-item-menu';
    menuButton.innerHTML = `
        <div class="history-item-menu-dots">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;
    
    // Create delete button
    const deleteButton = document.createElement('div');
    deleteButton.className = 'delete-button';
    deleteButton.textContent = 'Delete Scan';
    
    // Add click event to show delete button
    menuButton.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent item click event from firing
        deleteButton.classList.toggle('show');
    });
    
    // Add click event to delete this item
    deleteButton.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent item click event from firing
        deleteHistoryItem(scan.id);
    });
    
    item.appendChild(symptomDiv);
    item.appendChild(detailDiv);
    item.appendChild(menuButton);
    item.appendChild(deleteButton);
    
    // History item created successfully
    
    // Add click event to load this scan result
    item.addEventListener('click', () => {
        displayResult(scan.id);
        closeNavbarFunc();
    });
    
    return item;
}

// Function to delete a history item
function deleteHistoryItem(id) {
    // Get existing scans
    let scans = JSON.parse(localStorage.getItem('mehelper-scans') || '[]');
    
    // Filter out the scan with the given id
    scans = scans.filter(scan => scan.id !== id);
    
    // Save updated scans to local storage
    localStorage.setItem('mehelper-scans', JSON.stringify(scans));
    
    // Hide all delete buttons
    document.querySelectorAll('.delete-button').forEach(btn => {
        btn.classList.remove('show');
    });
    
    // Refresh the history list
    loadPreviousScans();
}

// New 8-Level Triage System Functions
function displayComprehensiveTriage(formData, riskLevel) {
    // Safety check for required elements
    if (!document.getElementById('level-1-reassurance') || !resultCard) {
        console.error('Required DOM elements not found');
        return;
    }
    
    // Ensure riskLevel is valid, default to 'low' if undefined or invalid
    const validRiskLevels = ['low', 'moderate', 'high', 'emergency'];
    riskLevel = validRiskLevels.includes(riskLevel) ? riskLevel : 'low';
    
    // Level 1: Reassurance Level
    displayReassuranceLevel(formData, riskLevel);
    
    // Level 2: Initial Assessment
    displayInitialAssessment(formData, riskLevel);
    
    // Level 3: Pathological Possibilities
    displayPathologicalPossibilities(formData);
    
    // Level 4: First Aid Measures
    displayFirstAidMeasures(formData, riskLevel);
    
    // Level 5: Danger Signs Alert (if applicable)
    displayDangerSignsAlert(formData, riskLevel);
    
    // Level 6: Vital Signs Analysis
    displayVitalSignsAnalysis(formData);
    
    // Level 7: Summary Report
    displaySummaryReport(formData, riskLevel);
    
    // Level 8: Hospital Map functionality removed
}

function displayReassuranceLevel(formData, riskLevel) {
    const reassuranceLevel = document.getElementById('level-1-reassurance');
    const message = document.getElementById('reassurance-message');
    
    if (!reassuranceLevel || !message) {
        console.error('Reassurance level elements not found');
        return;
    }
    
    if (riskLevel === 'low') {
        message.textContent = "These symptoms are usually mild and not worrisome. Rest, drink plenty of water, and if they persist or worsen, see a doctor.";
    } else if (riskLevel === 'moderate') {
        message.textContent = "While these symptoms may be concerning, they are often manageable at home initially. Monitor closely and seek care if they worsen.";
    } else {
        message.textContent = "These symptoms require medical attention. Please follow the guidance below carefully.";
    }
}

function displayInitialAssessment(formData, riskLevel) {
    const assessmentBadge = document.getElementById('assessment-badge');
    const conditionSeverity = document.getElementById('condition-severity');
    
    const severityMap = {
        'low': 'mild',
        'moderate': 'moderate',
        'high': 'severe',
        'emergency': 'critical'
    };
    
    conditionSeverity.textContent = severityMap[riskLevel] || 'mild';
    assessmentBadge.textContent = `${severityMap[riskLevel] || 'mild'} condition`;
    assessmentBadge.className = `level-badge level-${riskLevel}`;
}

function displayPathologicalPossibilities(formData) {
    const possibilitiesList = document.getElementById('possibilities-list');
    possibilitiesList.innerHTML = '';
    
    const possibilities = generatePossibleCauses(formData);
    possibilities.forEach(possibility => {
        const li = document.createElement('li');
        li.textContent = possibility;
        possibilitiesList.appendChild(li);
    });
}

function generatePossibleCauses(formData) {
    // Handle both string and array types for symptoms
    const symptoms = typeof formData.symptoms === 'string' ? formData.symptoms.toLowerCase() : '';
    const selectedSymptoms = formData.selectedSymptoms || [];
    const causes = [];
    
    if (symptoms.includes('fever') || selectedSymptoms.includes('fever')) {
        if (symptoms.includes('cough') || selectedSymptoms.includes('cough')) {
            causes.push('Respiratory infection (cold, flu, bronchitis)');
        }
        if (symptoms.includes('rash') || selectedSymptoms.includes('rash')) {
            causes.push('Viral infection with rash (measles, chickenpox)');
            causes.push('Allergic reaction');
        }
        if (symptoms.includes('headache') || selectedSymptoms.includes('headache')) {
            causes.push('Viral illness or flu');
        }
    }
    
    if (symptoms.includes('pain') || selectedSymptoms.includes('pain')) {
        if (symptoms.includes('chest')) {
            causes.push('Muscle strain or chest wall pain');
            causes.push('Heart-related issues (seek medical evaluation)');
        }
        if (symptoms.includes('head')) {
            causes.push('Tension headache or migraine');
            causes.push('Sinus infection');
        }
        if (symptoms.includes('stomach') || symptoms.includes('abdominal')) {
            causes.push('Gastroenteritis or food poisoning');
            causes.push('Appendicitis (if severe, seek immediate care)');
        }
    }
    
    if (symptoms.includes('nausea') || selectedSymptoms.includes('nausea')) {
        causes.push('Gastroenteritis or stomach flu');
        causes.push('Food poisoning');
    }
    
    if (symptoms.includes('diarrhea') || selectedSymptoms.includes('diarrhea')) {
        causes.push('Gastroenteritis or stomach flu');
        causes.push('Food poisoning');
    }
    
    // Mental health symptoms
    if (symptoms.includes('anxiety') || selectedSymptoms.includes('anxiety')) {
        causes.push('Anxiety disorder or acute stress response');
        causes.push('Panic attacks or situational anxiety');
    }
    
    if (symptoms.includes('depression') || selectedSymptoms.includes('depression')) {
        causes.push('Major depressive episode');
        causes.push('Seasonal or situational depression');
    }
    
    if (symptoms.includes('stress') || selectedSymptoms.includes('stress')) {
        causes.push('Acute stress reaction');
        causes.push('Work or life-related stress');
    }
    
    if (selectedSymptoms.includes('other')) {
        causes.push('Unspecified symptoms requiring further evaluation');
        causes.push('Multiple symptom complex');
    }
    
    if (causes.length === 0) {
        causes.push('General viral illness');
        causes.push('Stress-related symptoms');
        causes.push('Dehydration or fatigue');
    }
    
    return causes.slice(0, 3); // Return top 3 possibilities
}

function displayFirstAidMeasures(formData, riskLevel) {
    const firstAidList = document.getElementById('first-aid-list');
    firstAidList.innerHTML = '';
    
    const measures = generateFirstAidMeasures(formData, riskLevel);
    measures.forEach(measure => {
        const li = document.createElement('li');
        li.textContent = measure;
        firstAidList.appendChild(li);
    });
}

function displayAIResults(aiResult) {
    // Update level 2: Initial Assessment - Fix the element selection
    const assessmentBadge = document.getElementById('assessment-badge');
    const conditionSeverity = document.getElementById('condition-severity');
    
    // Map risk levels to severity terms and update both elements properly
    if (assessmentBadge && conditionSeverity) {
        const validRiskLevel = ['low', 'moderate', 'high', 'emergency'].includes(aiResult.risk_level) ? aiResult.risk_level : 'low';
        
        const severityMap = {
            'low': 'mild',
            'moderate': 'moderate', 
            'high': 'severe',
            'emergency': 'critical'
        };
        
        const severity = severityMap[validRiskLevel] || 'mild';
        
        // Update the condition severity text
        conditionSeverity.textContent = severity;
        
        // Update the assessment badge
        assessmentBadge.textContent = `${severity} condition`;
        assessmentBadge.className = `level-badge level-${validRiskLevel}`;
    }
    
    // Update level 2: Pathological Possibilities
    const possibilitiesList = document.getElementById('possibilities-list');
    if (possibilitiesList) {
        possibilitiesList.innerHTML = '';
        if (aiResult.possible_conditions) {
            aiResult.possible_conditions.forEach(condition => {
                const li = document.createElement('li');
                li.textContent = condition;
                possibilitiesList.appendChild(li);
            });
        }
    }
    
    // Update level 3: First Aid Measures
    const firstAidList = document.getElementById('first-aid-list');
    if (firstAidList) {
        firstAidList.innerHTML = '';
        if (aiResult.first_aid_measures) {
            aiResult.first_aid_measures.forEach(measure => {
                const li = document.createElement('li');
                li.textContent = measure;
                firstAidList.appendChild(li);
            });
        }
    }
    
    // Update level 4: Immediate Actions
    const immediateActionsList = document.getElementById('immediate-actions-list');
    if (immediateActionsList) {
        immediateActionsList.innerHTML = '';
        if (aiResult.immediate_actions) {
            aiResult.immediate_actions.forEach(action => {
                const li = document.createElement('li');
                li.textContent = action;
                immediateActionsList.appendChild(li);
            });
        }
    }
    
    // Update level 5: Danger Signs
    const dangerLevel = document.getElementById('level-5-danger');
    const dangerSignsList = document.getElementById('danger-signs-list');
    if (dangerSignsList) {
        dangerSignsList.innerHTML = '';
        if (aiResult.danger_signs && aiResult.danger_signs.length > 0) {
            if (dangerLevel) dangerLevel.classList.remove('hidden');
            aiResult.danger_signs.forEach(sign => {
                const li = document.createElement('li');
                li.textContent = sign;
                dangerSignsList.appendChild(li);
            });
        } else {
            if (dangerLevel) dangerLevel.classList.add('hidden');
        }
    }
    
    // Update level 6: Vital Signs Analysis
    const vitalsAnalysis = document.getElementById('vitals-analysis');
    if (vitalsAnalysis) {
        vitalsAnalysis.innerHTML = '';
        if (aiResult.vitals_analysis && aiResult.vitals_analysis.length > 0) {
            aiResult.vitals_analysis.forEach(analysis => {
                const p = document.createElement('p');
                p.innerHTML = analysis;
                vitalsAnalysis.appendChild(p);
            });
        }
    }
    
    // Add image analysis section if available (Level 8)
    const level8ImageAnalysis = document.getElementById('level-8-image-analysis');
    const imageAnalysisFindings = document.getElementById('image-analysis-findings');
    
    // Check if image was uploaded during this analysis
    const imageInput = document.getElementById('image-input');
    const imageWasUploaded = imageInput && imageInput.files && imageInput.files.length > 0;
    
    console.log('DEBUG - aiResult keys:', Object.keys(aiResult));
    console.log('DEBUG - image_analysis_included:', aiResult.image_analysis_included);
    console.log('DEBUG - image_findings:', aiResult.image_findings);
    console.log('DEBUG - image_message:', aiResult.image_message);
    console.log('DEBUG - imageWasUploaded:', imageWasUploaded);
    
    if (aiResult.image_analysis_included && aiResult.image_findings) {
        // Successful AI image analysis
        if (level8ImageAnalysis && imageAnalysisFindings) {
            level8ImageAnalysis.classList.remove('hidden');
            
            // Format the Gemini analysis for better readability
            const formattedAnalysis = formatGeminiAnalysis(aiResult.image_findings);
            imageAnalysisFindings.innerHTML = formattedAnalysis;
            console.log('Level 8 shown with successful image analysis:', aiResult.image_findings);
        }
    } else if (imageWasUploaded) {
        // Image uploaded but analysis unavailable - show informative message
        if (level8ImageAnalysis && imageAnalysisFindings) {
            level8ImageAnalysis.classList.remove('hidden');
            
            let message = '';
            if (aiResult.image_message) {
                // Use the detailed message from the backend
                message = `<p><em>${aiResult.image_message}</em></p>`;
            } else {
                // Fallback message
                message = `<p><em>Image was uploaded but AI analysis is currently unavailable. Please describe any visible symptoms, wounds, rashes, swelling, discoloration, or other medical findings you can see in the uploaded image within your symptom description above.</em></p>`;
            }
            
            imageAnalysisFindings.innerHTML = message;
            console.log('Level 8 shown with informative message - image uploaded but analysis unavailable');
        }
    } else {
        // Hide level 8 if no image uploaded
        if (level8ImageAnalysis) {
            level8ImageAnalysis.classList.add('hidden');
        }
        console.log('Level 8 hidden - no image uploaded');
    }
    
    // Update level 7: Timeline & Recommendations
    const timelineContent = document.getElementById('timeline-content');
    if (timelineContent) {
        timelineContent.innerHTML = '';
        if (aiResult.timeline_recommendations) {
            Object.keys(aiResult.timeline_recommendations).forEach(timeframe => {
                const section = document.createElement('div');
                section.className = 'timeline-section';
                
                const title = document.createElement('h4');
                title.textContent = timeframe;
                
                const list = document.createElement('ul');
                if (aiResult.timeline_recommendations[timeframe]) {
                    aiResult.timeline_recommendations[timeframe].forEach(item => {
                        const li = document.createElement('li');
                        li.textContent = item;
                        list.appendChild(li);
                    });
                }
                
                section.appendChild(title);
                section.appendChild(list);
                timelineContent.appendChild(section);
            });
        }
    }
}

function generateFirstAidMeasures(formData, riskLevel) {
    const measures = [];
    // Handle both string and array types for symptoms
    const symptoms = typeof formData.symptoms === 'string' ? formData.symptoms.toLowerCase() : '';
    const selectedSymptoms = formData.selectedSymptoms || [];
    
    // General measures
    measures.push('Rest and avoid strenuous activities');
    measures.push('Stay hydrated by drinking plenty of fluids');
    measures.push('Monitor symptoms for changes or worsening');
    
    if (symptoms.includes('fever') || selectedSymptoms.includes('fever')) {
        measures.push('Use cool compresses or take lukewarm baths');
        measures.push('Take fever-reducing medication if available (paracetamol/acetaminophen)');
    }
    
    if (symptoms.includes('pain') || selectedSymptoms.includes('pain')) {
        measures.push('Apply cold or warm compresses to painful areas');
        measures.push('Take pain relievers if available (ibuprofen or acetaminophen)');
    }
    
    if (symptoms.includes('nausea') || selectedSymptoms.includes('nausea')) {
        measures.push('Eat small, bland meals (crackers, toast, rice)');
        measures.push('Avoid spicy, fatty, or dairy foods');
    }
    
    if (symptoms.includes('diarrhea') || selectedSymptoms.includes('diarrhea')) {
        measures.push('Drink oral rehydration solutions or clear fluids');
        measures.push('Follow the BRAT diet (bananas, rice, applesauce, toast)');
    }
    
    if (symptoms.includes('cough') || selectedSymptoms.includes('cough')) {
        measures.push('Use honey in warm tea or water (avoid in children under 1)');
        measures.push('Use a humidifier or breathe steam from a hot shower');
    }
    
    // Mental health symptoms
    if (symptoms.includes('anxiety') || selectedSymptoms.includes('anxiety')) {
        measures.push('Practice deep breathing exercises (4-7-8 technique)');
        measures.push('Find a quiet, safe space to relax');
        measures.push('Consider talking to someone you trust');
    }
    
    if (symptoms.includes('depression') || selectedSymptoms.includes('depression')) {
        measures.push('Maintain a regular sleep schedule');
        measures.push('Engage in gentle physical activity if possible');
        measures.push('Reach out to friends, family, or a mental health professional');
    }
    
    if (symptoms.includes('stress') || selectedSymptoms.includes('stress')) {
        measures.push('Practice stress-reduction techniques (meditation, mindfulness)');
        measures.push('Take breaks from stressful activities');
        measures.push('Ensure adequate sleep and nutrition');
    }
    
    if (selectedSymptoms.includes('other')) {
        measures.push('Document all symptoms in detail for healthcare providers');
        measures.push('Monitor symptoms for patterns or triggers');
        measures.push('Seek appropriate medical evaluation');
    }
    
    return measures;
}

function displayDangerSignsAlert(formData, riskLevel) {
    const dangerLevel = document.getElementById('level-5-danger');
    const dangerSignsList = document.getElementById('danger-signs-list');
    dangerSignsList.innerHTML = '';
    
    const dangerSigns = generateDangerSigns(formData, riskLevel);
    
    if (dangerSigns.length > 0) {
        dangerLevel.classList.remove('hidden');
        dangerSigns.forEach(sign => {
            const li = document.createElement('li');
            li.textContent = sign;
            dangerSignsList.appendChild(li);
        });
    } else {
        dangerLevel.classList.add('hidden');
    }
}

function generateDangerSigns(formData, riskLevel) {
    const dangerSigns = [];
    // Handle both string and array types for symptoms
    const symptoms = typeof formData.symptoms === 'string' ? formData.symptoms.toLowerCase() : '';
    const selectedSymptoms = formData.selectedSymptoms || [];
    
    // Universal danger signs
    dangerSigns.push('Difficulty breathing or shortness of breath');
    dangerSigns.push('Loss of consciousness or unresponsiveness');
    dangerSigns.push('Severe bleeding that won\'t stop');
    dangerSigns.push('Chest pain or pressure that radiates to arm/jaw');
    dangerSigns.push('Sudden severe headache with confusion');
    dangerSigns.push('High fever (above 39.5°C or 103°F) in adults');
    
    if (formData.age && parseInt(formData.age) < 5) {
        dangerSigns.push('High fever (above 38.5°C or 101.3°F) in children');
        dangerSigns.push('Refusing to eat or drink for extended periods');
    }
    
    if (symptoms.includes('rash') || selectedSymptoms.includes('rash')) {
        dangerSigns.push('Purple or bruise-like rash that doesn\'t fade when pressed');
    }
    
    // Mental health danger signs
    if (symptoms.includes('depression') || selectedSymptoms.includes('depression') ||
        symptoms.includes('anxiety') || selectedSymptoms.includes('anxiety')) {
        dangerSigns.push('Thoughts of self-harm or suicide');
        dangerSigns.push('Complete inability to function or get out of bed');
        dangerSigns.push('Severe panic attacks lasting hours');
    }
    
    return dangerSigns;
}

function displayVitalSignsAnalysis(formData) {
    const vitalsAnalysis = document.getElementById('vitals-analysis');
    vitalsAnalysis.innerHTML = '';
    
    const analysis = analyzeVitalSigns(formData);
    
    if (analysis.length > 0) {
        analysis.forEach(item => {
            const p = document.createElement('p');
            p.innerHTML = item;
            vitalsAnalysis.appendChild(p);
        });
    } else {
        vitalsAnalysis.innerHTML = '<p>No vital signs provided for analysis.</p>';
    }
}

function analyzeVitalSigns(formData) {
    const analysis = [];
    const age = parseInt(formData.age) || 30; // Default adult age
    
    // Temperature analysis
    if (formData.temperature) {
        const temp = parseFloat(formData.temperature);
        let tempAnalysis = '';
        
        if (temp < 36.0) {
            tempAnalysis = `<strong>Temperature ${temp}°C → Low</strong> (hypothermia possible)`;
        } else if (temp >= 36.0 && temp < 37.5) {
            tempAnalysis = `<strong>Temperature ${temp}°C → Normal range</strong>`;
        } else if (temp >= 37.5 && temp < 38.5) {
            tempAnalysis = `<strong>Temperature ${temp}°C → Mild fever</strong>`;
        } else if (temp >= 38.5 && temp < 39.5) {
            tempAnalysis = `<strong>Temperature ${temp}°C → Moderate fever</strong>`;
        } else {
            tempAnalysis = `<strong>Temperature ${temp}°C → High fever</strong> (seek medical attention)`;
        }
        analysis.push(tempAnalysis);
    }
    
    // Heart rate analysis
    if (formData.heartRate) {
        const hr = parseInt(formData.heartRate);
        let hrAnalysis = '';
        
        // Age-based normal ranges
        let normalMin, normalMax;
        if (age < 1) {
            normalMin = 100; normalMax = 160;
        } else if (age < 3) {
            normalMin = 80; normalMax = 130;
        } else if (age < 6) {
            normalMin = 75; normalMax = 120;
        } else if (age < 12) {
            normalMin = 70; normalMax = 110;
        } else if (age < 18) {
            normalMin = 60; normalMax = 100;
        } else {
            normalMin = 60; normalMax = 100;
        }
        
        if (hr < normalMin) {
            hrAnalysis = `<strong>Heart rate ${hr} BPM → Lower than normal</strong> for age ${age} (normal: ${normalMin}-${normalMax})`;
        } else if (hr > normalMax) {
            hrAnalysis = `<strong>Heart rate ${hr} BPM → Higher than normal</strong> for age ${age} (normal: ${normalMin}-${normalMax})`;
        } else {
            hrAnalysis = `<strong>Heart rate ${hr} BPM → Normal range</strong> for age ${age}`;
        }
        analysis.push(hrAnalysis);
    }
    
    return analysis;
}

function displaySummaryReport(formData, riskLevel) {
    const summaryReport = document.getElementById('summary-report');
    const nextAction = document.getElementById('next-action-recommendation');
    
    // Build summary
    const summary = buildSummary(formData, riskLevel);
    summaryReport.innerHTML = summary;
    
    // Determine next action
    const recommendation = getNextActionRecommendation(riskLevel);
    nextAction.textContent = recommendation;
}

function buildSummary(formData, riskLevel) {
    const symptoms = formData.symptoms || 'No specific symptoms described';
    const duration = formData.duration || 'Not specified';
    const temperature = formData.temperature || 'Not measured';
    const heartRate = formData.heartRate || 'Not measured';
    
    return `
        <p><strong>Basic Data:</strong> Age ${formData.age}, ${formData.sex}</p>
        <p><strong>Symptoms:</strong> ${symptoms}</p>
        <p><strong>Duration:</strong> ${duration}</p>
        <p><strong>Vital Signs:</strong> Temperature ${temperature}°C, Heart Rate ${heartRate} BPM</p>
        <p><strong>Assessment:</strong> ${riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} risk level</p>
    `;
}

function getNextActionRecommendation(riskLevel) {
    const recommendations = {
        'low': 'You can continue at home with rest and monitoring. Contact a doctor if symptoms persist beyond 7 days or worsen.',
        'moderate': 'It is preferable to see a doctor within 24-48 hours if symptoms don\'t improve or if new symptoms develop.',
        'high': 'Go to the hospital or see a doctor within 24 hours. Monitor for any danger signs.',
        'emergency': 'Go immediately to the hospital emergency department or call emergency services. This may be urgent.'
    };
    
    return recommendations[riskLevel] || 'Contact a healthcare provider for personalized advice.';
}



// Update form submission to use new triage system
triageForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Collect form data
    const formData = {
        age: document.getElementById('age').value,
        sex: document.getElementById('sex').value,
        symptoms: document.getElementById('symptoms-text').value,
        selectedSymptoms: Array.from(document.querySelectorAll('.chip.active')).map(chip => chip.dataset.value),
        duration: document.getElementById('duration').value,
        temperature: document.getElementById('temperature').value,
        heartRate: document.getElementById('heart-rate').value
    };
    
    // Determine risk level
    const riskLevel = determineRiskLevel(formData);
    
    // Display comprehensive triage
    displayComprehensiveTriage(formData, riskLevel);
    
    // Show results
    resultCard.classList.remove('hidden');
    
    // Note: History is saved in analyzeTriage function - no need to save here
    
    // Scroll to results
    resultCard.scrollIntoView({ behavior: 'smooth' });
});

function determineRiskLevel(formData) {
    // Handle both string and array types for symptoms
    const symptoms = typeof formData.symptoms === 'string' ? formData.symptoms.toLowerCase() : '';
    const selectedSymptoms = formData.selectedSymptoms || [];
    const age = parseInt(formData.age) || 30; // Default adult age
    const temperature = parseFloat(formData.temperature) || 0;
    const heartRate = parseInt(formData.heartRate) || 0;
    
    // Emergency level indicators
    if (symptoms.includes('chest pain') || symptoms.includes('heart attack') || 
        symptoms.includes('difficulty breathing') || symptoms.includes('can\'t breathe') ||
        symptoms.includes('severe bleeding') || symptoms.includes('unconscious') ||
        symptoms.includes('stroke') || symptoms.includes('seizure')) {
        return 'emergency';
    }
    
    // High risk indicators
    if (temperature >= 39.5 || heartRate > 120 || 
        symptoms.includes('severe') || symptoms.includes('intense') ||
        (age < 5 && temperature >= 38.5)) {
        return 'high';
    }
    
    // Moderate risk indicators
    if (temperature >= 38.0 || symptoms.includes('moderate') || 
        selectedSymptoms.length >= 3 || formData.duration === '3-7days') {
        return 'moderate';
    }
    
    return 'low';
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    loadPreviousScans();
    
    // Map functionality removed - no hospital map display
});

// Location sharing functionality
function shareLocation() {
    const button = document.getElementById('send-location-btn');
    
    // Check if geolocation is supported
    if (!navigator.geolocation) {
        alert('Geolocation is not supported by this browser.');
        return;
    }
    
    // Disable button during location request
    button.disabled = true;
    button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M12 1v6m0 14v6"></path></svg> Getting Location...';
    
    // Request location
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            generateShareableLink(latitude, longitude);
            
            // Re-enable button
            button.disabled = false;
            button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> Send My Location';
        },
        (error) => {
            let errorMessage = 'Unable to get your location.';
            
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage = 'Location access denied by user. Please enable location permissions in your browser settings.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage = 'Location information is unavailable.';
                    break;
                case error.TIMEOUT:
                    errorMessage = 'Location request timed out.';
                    break;
                default:
                    errorMessage = 'An unknown error occurred while getting your location.';
            }
            
            alert(errorMessage);
            
            // Re-enable button
            button.disabled = false;
            button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> Send My Location';
        },
        {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
        }
    );
}

function generateShareableLink(lat, lng) {
    // Create Google Maps and OpenStreetMap links
    const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
    const osmUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`;
    
    // Create a simple share message
    const shareMessage = `I'm sharing my location with you:\n\nLatitude: ${lat}\nLongitude: ${lng}\n\nGoogle Maps: ${googleMapsUrl}\nOpenStreetMap: ${osmUrl}\n\nShared via MeHelper`;
    
    // Create sharing options
    showShareOptions(shareMessage, googleMapsUrl, osmUrl);
}

function showShareOptions(message, googleMapsUrl, osmUrl) {
    // Create a modal for sharing options
    const modal = document.createElement('div');
    modal.className = 'share-modal';
    modal.innerHTML = `
        <div class="share-modal-content">
            <h3>Share Your Location</h3>
            <p>Having someone nearby can be crucial in medical situations. Share your location with someone you trust:</p>
            <p class="support-text">Remember - you don't have to handle this alone. Reaching out to family, friends or caregivers can provide vital support and assistance when you need it most.</p>
            
            <div class="share-buttons">
                <button class="btn btn-primary" id="copy-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                    Copy to Clipboard
                </button>
                
                <button class="btn btn-location" id="whatsapp-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                    WhatsApp
                </button>
                
                <button class="btn btn-location" id="messenger-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                    Messenger
                </button>
            </div>
            
            <div class="map-links">
                <p><strong>Direct Links:</strong></p>
                <a href="${googleMapsUrl}" target="_blank" class="btn btn-primary">Open in Google Maps</a>
                <a href="${osmUrl}" target="_blank" class="btn btn-primary">Open in OpenStreetMap</a>
            </div>
            
            <button class="btn" id="close-modal-btn" style="margin-top: 1rem;">Close</button>
        </div>
    `;
    
    // Add modal styles
    if (!document.querySelector('#share-modal-styles')) {
        const styles = document.createElement('style');
        styles.id = 'share-modal-styles';
        styles.textContent = `
            .share-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
            }
            
            .share-modal-content {
                background: white;
                padding: 2rem;
                border-radius: 16px;
                max-width: 400px;
                width: 90%;
                text-align: center;
            }
            
            .share-buttons {
                display: flex;
                flex-direction: column;
                gap: 1rem;
                margin: 1.5rem 0;
            }
            
            .map-links {
                margin-top: 1rem;
            }
            
            .map-links a {
                margin: 0.25rem;
                text-decoration: none;
            }
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(modal);
    
    // Add event listeners for the modal buttons
    document.getElementById('copy-btn').addEventListener('click', () => {
        copyToClipboard(message);
    });
    
    document.getElementById('whatsapp-btn').addEventListener('click', () => {
        shareViaWhatsApp(message);
    });
    
    document.getElementById('messenger-btn').addEventListener('click', () => {
        shareViaMessenger(message);
    });
    
    document.getElementById('close-modal-btn').addEventListener('click', closeShareModal);
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeShareModal();
        }
    });
}

function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => {
            alert('Location details copied to clipboard!');
            closeShareModal();
        }).catch(err => {
            console.error('Could not copy text: ', err);
            fallbackCopyToClipboard(text);
        });
    } else {
        fallbackCopyToClipboard(text);
    }
}

function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    textArea.style.top = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        alert('Location details copied to clipboard!');
    } catch (err) {
        console.error('Fallback copy failed:', err);
        alert('Could not copy to clipboard. Please select and copy the text manually.');
    }
    
    document.body.removeChild(textArea);
    closeShareModal();
}

function shareViaWhatsApp(text) {
    const encodedText = encodeURIComponent(text);
    let whatsappUrl;
    
    // Check if on mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
        whatsappUrl = `whatsapp://send?text=${encodedText}`;
    } else {
        whatsappUrl = `https://wa.me/?text=${encodedText}`;
    }
    
    // Try to open the URL
    try {
        window.open(whatsappUrl, '_blank');
    } catch (e) {
        // Fallback for mobile
        window.location.href = whatsappUrl;
    }
    closeShareModal();
}

function shareViaMessenger(text) {
    const encodedText = encodeURIComponent(text);
    const messengerUrl = `https://www.facebook.com/dialog/send?link&app_id=291494419107600&redirect_uri=https://www.messenger.com&to&text=${encodedText}`;
    
    try {
        window.open(messengerUrl, '_blank');
    } catch (e) {
        console.error('Messenger sharing failed:', e);
        alert('Could not open Messenger. Please copy the location details and share manually.');
    }
    closeShareModal();
}

function closeShareModal() {
    const modal = document.querySelector('.share-modal');
    if (modal) {
        modal.remove();
    }
}

// Format Gemini analysis for better UI display
function formatGeminiAnalysis(analysisText) {
    if (!analysisText) return '<p><em>No analysis available</em></p>';
    
    // Split analysis into sections and format appropriately
    let formattedHtml = '<div class="gemini-analysis-formatted">';
    
    // Convert bullet points to proper HTML lists
    let processedText = analysisText
        .replace(/\*\s+\*\*([^*]+)\*\*:?\s*([^\n*]+)/g, '<div class="analysis-item"><strong>$1:</strong> $2</div>')
        .replace(/\*\s+([^\n*]+)/g, '<li>$1</li>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\n\n/g, '</div><div class="analysis-section">')
        .replace(/\n/g, '<br>');
    
    // Wrap lists properly
    processedText = processedText.replace(/(<li>.*?<\/li>)/gs, '<ul>$1</ul>');
    
    // Structure the content with proper sections
    const sections = processedText.split('</div><div class="analysis-section">');
    
    sections.forEach((section, index) => {
        if (section.trim()) {
            formattedHtml += `<div class="analysis-section">${section}`;
            if (index < sections.length - 1) {
                formattedHtml += '</div>';
            }
        }
    });
    
    formattedHtml += '</div></div>';
    
    // Add a header
    const finalHtml = `
        <div class="ai-analysis-header">
            <h5>🔍 AI Visual Analysis Results</h5>
            <div class="analysis-badge">AI Vision Analysis</div>
        </div>
        ${formattedHtml}
        <div class="analysis-disclaimer">
            <small><em>⚠️ This AI analysis supplements your description and is not a medical diagnosis. Consult healthcare providers for professional evaluation.</em></small>
        </div>
    `;
    
    return finalHtml;
}

// ============================= 
// AUDIO READING FUNCTIONALITY
// ============================= 

let currentSpeech = null;

// Initialize audio buttons
function initAudioButtons() {
    // Add event listeners to all audio buttons
    document.addEventListener('click', (e) => {
        if (e.target.closest('.audio-btn')) {
            const audioBtn = e.target.closest('.audio-btn');
            const level = audioBtn.getAttribute('data-level');
            handleAudioClick(audioBtn, level);
        }
    });
}

// Handle audio button click
function handleAudioClick(audioBtn, level) {
    // If this button is currently playing, stop it
    if (audioBtn.classList.contains('playing')) {
        speechSynthesis.cancel();
        audioBtn.classList.remove('playing');
        currentSpeech = null;
        return;
    }
    
    // Stop any other currently playing speech
    if (currentSpeech) {
        speechSynthesis.cancel();
        document.querySelectorAll('.audio-btn').forEach(btn => {
            btn.classList.remove('playing');
        });
        currentSpeech = null;
    }
    
    // Get text content for the specific level
    const textToRead = getLevelTextContent(level);
    
    if (!textToRead) {
        console.warn('No text content found for level', level);
        return;
    }
    
    // Check if speech synthesis is available
    if (!('speechSynthesis' in window)) {
        alert('Speech synthesis not supported in this browser.');
        return;
    }
    
    // Create and configure speech
    currentSpeech = new SpeechSynthesisUtterance(textToRead);
    currentSpeech.rate = 0.9;
    currentSpeech.pitch = 1;
    currentSpeech.volume = 0.8;
    
    // Add event listeners for speech events
    currentSpeech.onstart = () => {
        audioBtn.classList.add('playing');
    };
    
    currentSpeech.onend = () => {
        audioBtn.classList.remove('playing');
        currentSpeech = null;
    };
    
    currentSpeech.onerror = () => {
        audioBtn.classList.remove('playing');
        currentSpeech = null;
        console.error('Speech synthesis error');
    };
    
    // Start speaking
    speechSynthesis.speak(currentSpeech);
}

// Get text content for a specific level
function getLevelTextContent(level) {
    const levelElement = document.getElementById(`level-${level}-${getLevelIdSuffix(level)}`);
    
    if (!levelElement || levelElement.classList.contains('hidden')) {
        return null;
    }
    
    let text = '';
    
    // Get the level title
    const titleElement = levelElement.querySelector('h4');
    if (titleElement) {
        text += titleElement.textContent + '. ';
    }
    
    // Get the content based on level type
    const contentElement = levelElement.querySelector('.level-content');
    if (contentElement) {
        // For lists, read each item
        const listItems = contentElement.querySelectorAll('li');
        if (listItems.length > 0) {
            listItems.forEach((item, index) => {
                text += `${index + 1}. ${item.textContent}. `;
            });
        } else {
            // For paragraphs and other content
            const paragraphs = contentElement.querySelectorAll('p, div:not(.analysis-disclaimer):not(.ai-analysis-header)');
            paragraphs.forEach(p => {
                const textContent = p.textContent.trim();
                if (textContent && !textContent.includes('⚠️')) {
                    text += textContent + '. ';
                }
            });
        }
    }
    
    // Clean up text
    text = text.replace(/\s+/g, ' ').trim();
    
    return text || null;
}

// Get level ID suffix based on level number
function getLevelIdSuffix(level) {
    const suffixes = {
        '1': 'reassurance',
        '2': 'assessment', 
        '3': 'possibilities',
        '4': 'first-aid',
        '5': 'danger',
        '6': 'vitals',
        '8': 'image-analysis'
    };
    
    return suffixes[level] || '';
}