# 🩺 MeHelper

**Primary Care, Anywhere. Intelligent Medical Triage for Remote Communities.**

> Bridging healthcare gaps in remote villages, isolated communities, and areas where the nearest clinic may be hours away. When professional medical help isn't immediately accessible, informed guidance can make all the difference.

---

## 🚨 The Problem

In remote areas worldwide, millions of people face a critical healthcare challenge:

- **Geographic Isolation**: The nearest medical facility can be hours or days away
- **Limited Medical Resources**: No healthcare professionals available locally
- **Emergency Uncertainty**: Difficulty determining when symptoms require immediate attention
- **Language Barriers**: Medical information often unavailable in local languages
- **Knowledge Gap**: Lack of basic first-aid knowledge in critical moments

**When every minute counts, people need reliable medical guidance instantly.**

---

## 💡 Our Solution

MeHelper is an intelligent medical triage system that provides:

### 🎯 **8-Level Comprehensive Triage System**
1. **Reassurance Level** - Comfort and initial guidance
2. **Initial Assessment** - Risk classification (mild/moderate/severe/emergency)
3. **Pathological Possibilities** - Most likely medical conditions
4. **First Aid Measures** - Immediate home care instructions
5. **Danger Signs Alert** - Critical warning signs to watch for
6. **Vital Signs Analysis** - Temperature and heart rate interpretation
7. **Summary Report** - Complete assessment with next steps
8. **AI Image Analysis** - Visual symptom recognition and analysis

### 🤖 **Advanced AI Integration**
- **GPT-OSS-20B** for sophisticated symptom analysis
- **Google Gemini 2.0 Flash** for medical image analysis
- **Local & Cloud Processing** for reliability in any environment
- **Multi-modal Analysis** combining text, image, and vital signs

### 🌍 **Designed for Remote Areas**
- **Offline-First Architecture** - Works with intermittent connectivity
- **Location Sharing** - Emergency GPS coordinate sharing
- **Audio Feedback** - Spoken guidance for accessibility
- **Progressive Enhancement** - Graceful degradation when services are unavailable

---

## ✨ Key Features

### 🔍 **Intelligent Symptom Analysis**
- Multi-symptom chip selection for quick input
- Natural language symptom description
- Duration tracking and pattern recognition
- Age and demographic risk factor consideration

### 📸 **AI-Powered Image Analysis**
- Medical image upload and analysis
- Wound, rash, and swelling detection
- Visual symptom correlation with text descriptions
- HIPAA-conscious local processing

### 📊 **Comprehensive Health Monitoring**
- Vital signs tracking (temperature, heart rate)
- Risk level classification with color-coded alerts
- Historical scan tracking and comparison
- Timeline recommendations for follow-up care

### 🚨 **Emergency Response Features**
- Automatic emergency keyword detection
- Critical danger sign alerts
- GPS location sharing for emergency services
- Escalation protocols for severe conditions

### 💾 **Privacy & Offline Support**
- Local data storage - no cloud dependency for basic features
- Scan history preservation
- Offline first-aid resource library
- Progressive web app capabilities

---

## 🛠 Technical Stack

### **Frontend**
- **HTML5/CSS3/JavaScript** - Progressive enhancement approach
- **Responsive Design** - Mobile-first for smartphone accessibility
- **Web APIs** - Geolocation, File Upload, Web Share
- **Accessibility** - WCAG compliant with audio feedback

### **Backend**
- **Python 3.8+** - Modern Python with type hints
- **Flask 2.3.3** - Lightweight web framework
- **RESTful APIs** - Clean separation of concerns

### **AI & Machine Learning**
- **OpenAI GPT-OSS-20B** - Advanced language model for medical analysis
- **Google Gemini 2.0 Flash** - Vision AI for medical image analysis
- **Transformers 4.55+** - Hugging Face model integration
- **PyTorch 2.6+** - Local model inference support

### **Infrastructure**
- **Hugging Face Inference API** - Cloud-based model serving
- **Environment Configuration** - Secure API key management
- **Image Processing** - PIL/Pillow for medical image optimization
- **Local Storage** - Browser-based persistence for offline capability

---

## 🌟 Why It Matters

### **Global Impact**
- **3.5 billion people** worldwide lack access to essential health services
- **Remote communities** often wait 4-6 hours for emergency medical help
- **1 in 4 deaths** in rural areas could be prevented with timely guidance
- **Healthcare workers** in remote areas lack decision support tools

### **Real-World Applications**
- **Rural Villages** - Primary healthcare decision support
- **Humanitarian Missions** - Field medical assistance
- **Disaster Response** - Triage support in emergency situations
- **Telemedicine** - Enhanced remote consultation capabilities
- **Medical Training** - Educational tool for healthcare workers

### **Innovation Advantages**
- **Cost-Effective** - Drastically reduces unnecessary emergency transport
- **Scalable** - Serves unlimited users simultaneously
- **Continuously Learning** - AI models improve with usage
- **Multilingual Ready** - Framework for local language support

---

## 🚀 Quick Start Demo

### **Prerequisites**
```bash
Python 3.8+
pip (Python package manager)
Modern web browser
```

### **Installation**
```bash
# 1. Clone or download the project
git clone https://github.com/George-Tharwat-Thabet/MeHelper.git
cd MeHelper

# 2. Create virtual environment (recommended)
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment variables
# Create .env file in project root:
echo "FLASK_ENV=development" > .env
echo "HF_TOKEN=your_huggingface_token_here" >> .env
echo "GEMINI_API_KEY=your_gemini_key_here" >> .env
```

### **Launch Application**
```bash
# Start the Flask server
python app.py

# Open browser and navigate to:
# http://localhost:5000
```

### **Try It Out**
1. **Start Triage** - Click "Start Triage" on homepage
2. **Enter Symptoms** - Fill in age, sex, symptoms, and duration
3. **Upload Image** (Optional) - Add photo of visible symptoms
4. **Get Analysis** - Receive comprehensive 8-level medical assessment
5. **View History** - Access previous scans via hamburger menu
6. **Emergency Features** - Test location sharing and audio feedback

### **API Testing**
```bash
# Health check
curl http://localhost:5000/api/health

# Symptom analysis
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"age": 30, "sex": "male", "symptoms": "fever headache", "duration": "2-3days"}'

# Image analysis
curl -X POST http://localhost:5000/api/analyze_image \
  -F "image=@sample_symptom_image.jpg"
```

---

## 📄 License & Credits

### **License**
```
MIT License

Copyright (c) 2024 MeHelper Project

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### **Credits & Acknowledgments**
- **OpenAI** - GPT models for medical language understanding
- **Google AI** - Gemini vision models for image analysis
- **Hugging Face** - Model hosting and inference infrastructure
- **Flask Community** - Lightweight web framework
- **Medical Professionals** - Guidance on triage protocols and safety measures

### **AI Models Used**
- **GPT-OSS-20B** - Primary symptom analysis and medical reasoning
- **Gemini 2.0 Flash** - Medical image analysis and visual symptom detection

### **Important Disclaimers**
⚠️ **MEDICAL DISCLAIMER**: This application is for informational purposes only and is not intended to be a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.

🚨 **EMERGENCY NOTICE**: In case of medical emergency, contact your local emergency services immediately. Do not rely solely on this application for emergency medical decisions.

🔒 **PRIVACY NOTICE**: Medical data is processed locally and temporarily. No personal health information is permanently stored on external servers without explicit consent.

---

**Built with ❤️ for global health equity**

*Making primary healthcare accessible to every corner of the world, one intelligent diagnosis at a time.*
