import os
import json
import re
import base64
from datetime import datetime
from typing import Optional, Dict, Any, List
from flask import Flask, request, jsonify, render_template_string, send_from_directory
from dotenv import load_dotenv
from PIL import Image
import io

# Load environment variables
load_dotenv()

# Check if using Inference Providers or local model
USE_INFERENCE_PROVIDERS = os.getenv('USE_INFERENCE_PROVIDERS', 'true').lower() == 'true'
HF_TOKEN = os.getenv('HF_TOKEN')

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = os.urandom(24)

# Import based on configuration
try:
    from openai import OpenAI
except ImportError:
    OpenAI = None

# Handle transformers import with proper typing
try:
    from transformers import pipeline, AutoTokenizer, AutoModelForCausalLM  # type: ignore
    import torch  # type: ignore
    TRANSFORMERS_AVAILABLE = True
except ImportError:
    print("Warning: transformers not available, using mock service")
    TRANSFORMERS_AVAILABLE = False
    # Type stubs for when transformers is not available
    pipeline = None  # type: ignore
    AutoTokenizer = None  # type: ignore
    AutoModelForCausalLM = None  # type: ignore
    torch = None  # type: ignore
class MockAIService:
    
    def _determine_risk_level(self, symptoms, vitals, age):
        """Determine risk level based on symptoms and vitals"""
        
        # Emergency keywords
        emergency_keywords = [
            'chest pain', 'heart attack', 'stroke', 'difficulty breathing', 'severe bleeding',
            'unconscious', 'seizure', 'allergic reaction', 'anaphylaxis', 'poisoning',
            'broken bone', 'severe burn', 'choking', 'drowning', 'electrocution'
        ]
        
        # Check for emergency keywords
        for keyword in emergency_keywords:
            if keyword in symptoms:
                return "emergency"
        
        # High risk symptoms
        high_risk = ['severe', 'intense', 'extreme', 'unbearable', 'worst']
        for word in high_risk:
            if word in symptoms:
                return "high"
        
        # Check vitals
        temp = vitals.get('temperature')
        heart_rate = vitals.get('heart_rate')
        
        if temp and (temp > 39.0 or temp < 35.0):
            return "high"
        
        if heart_rate and (heart_rate > 120 or heart_rate < 50):
            return "high"
        
        # Age factor
        if age < 5 or age > 65:
            return "moderate"
        
        # Duration factor
        if 'week' in symptoms or 'month' in symptoms:
            return "moderate"
        
        return "low"
    
    def _generate_reassurance(self, risk_level, symptoms):
        """Generate reassurance based on risk level"""
        if risk_level == "low":
            return "These symptoms appear to be mild and likely self-limiting. Most people recover within a few days with proper rest and home care."
        elif risk_level == "moderate":
            return "These symptoms warrant attention but don't appear immediately life-threatening. Monitoring and timely medical consultation are recommended."
        else:
            return "These symptoms require prompt medical evaluation to ensure your safety and proper treatment."
    
    def _generate_risk_assessment(self, risk_level, symptoms):
        """Generate risk assessment text"""
        assessments = {
            "emergency": "Critical condition requiring immediate emergency care",
            "high": "High risk condition - seek medical care within hours",
            "moderate": "Moderate concern - monitor closely and consider medical evaluation",
            "low": "Low risk condition - likely self-limiting, monitor symptoms"
        }
        return assessments.get(risk_level, "Unable to assess risk level")
    
    def _generate_conditions(self, symptoms, age, sex):
        """Generate possible conditions based on symptoms"""
        conditions = []
        
        symptom_map = {
            'fever': ['Viral infection', 'Bacterial infection', 'Flu'],
            'cough': ['Common cold', 'Bronchitis', 'COVID-19', 'Pneumonia'],
            'headache': ['Tension headache', 'Migraine', 'Sinus infection', 'Dehydration'],
            'stomach': ['Gastroenteritis', 'Food poisoning', 'Stomach flu'],
            'chest': ['Muscle strain', 'Anxiety', 'Heartburn', 'Respiratory infection'],
            'pain': ['Muscle strain', 'Inflammation', 'Injury', 'Infection'],
            'nausea': ['Gastroenteritis', 'Food poisoning', 'Motion sickness'],
            'diarrhea': ['Gastroenteritis', 'Food poisoning', 'Viral infection'],
            'anxiety': ['Anxiety disorder', 'Panic attacks', 'Acute stress response'],
            'depression': ['Major depressive episode', 'Seasonal depression', 'Situational depression'],
            'stress': ['Acute stress reaction', 'Work-related stress', 'Life stress'],
            'other': ['Unspecified condition', 'Multiple symptom complex', 'Requires further evaluation']
        }
        
        for keyword, conds in symptom_map.items():
            if keyword in symptoms:
                conditions.extend(conds)
        
        if not conditions:
            conditions = ['Viral illness', 'General fatigue', 'Stress-related symptoms']
        
        return list(set(conditions))[:3]  # Return unique top 3
    
    def _generate_first_aid(self, symptoms, risk_level):
        """Generate first aid measures"""
        measures = [
            "Rest and avoid strenuous activities",
            "Stay hydrated with water or clear fluids",
            "Monitor symptoms for changes"
        ]
        
        if 'fever' in symptoms:
            measures.extend([
                "Use cool compresses or lukewarm bath",
                "Take fever reducers if available (acetaminophen/ibuprofen)"
            ])
        
        if 'pain' in symptoms:
            measures.extend([
                "Apply cold or warm compress to affected area",
                "Take pain relievers if available"
            ])
        
        if 'cough' in symptoms:
            measures.extend([
                "Use honey in warm tea (avoid for children <1 year)",
                "Use humidifier or steam inhalation"
            ])
        
        if 'anxiety' in symptoms:
            measures.extend([
                "Practice deep breathing exercises",
                "Find a quiet, safe space to relax",
                "Consider talking to someone you trust"
            ])
        
        if 'depression' in symptoms:
            measures.extend([
                "Maintain regular sleep schedule",
                "Engage in gentle physical activity",
                "Reach out to mental health professional if needed"
            ])
        
        if 'stress' in symptoms:
            measures.extend([
                "Practice stress-reduction techniques",
                "Take breaks from stressful activities",
                "Ensure adequate sleep and nutrition"
            ])
        
        return measures
    
    def _generate_danger_signs(self, symptoms, age):
        """Generate danger signs to watch for"""
        danger_signs = [
            "Difficulty breathing or shortness of breath",
            "Severe or worsening pain",
            "High fever (>39.5°C or 103°F)",
            "Confusion or altered mental state",
            "Inability to keep fluids down"
        ]
        
        if age < 5:
            danger_signs.extend([
                "High fever in children (>38.5°C or 101.3°F)",
                "Refusing to eat or drink",
                "Unusual sleepiness or irritability"
            ])
        
        return danger_signs
    
    def _analyze_vitals(self, vitals, age):
        """Analyze vital signs"""
        analysis = []
        
        temp = vitals.get('temperature')
        heart_rate = vitals.get('heart_rate')
        
        if temp:
            if temp > 39.0:
                analysis.append(f"Temperature {temp}°C → High fever - monitor closely")
            elif temp > 37.5:
                analysis.append(f"Temperature {temp}°C → Mild fever")
            elif temp < 36.0:
                analysis.append(f"Temperature {temp}°C → Low - possible hypothermia")
            else:
                analysis.append(f"Temperature {temp}°C → Normal range")
        
        if heart_rate:
            if heart_rate > 100:
                analysis.append(f"Heart rate {heart_rate} bpm → Elevated - possible fever/stress")
            elif heart_rate < 60:
                analysis.append(f"Heart rate {heart_rate} bpm → Low - monitor for symptoms")
            else:
                analysis.append(f"Heart rate {heart_rate} bpm → Normal range")
        
        return "; ".join(analysis) if analysis else "No vitals provided for analysis"
    
    def _generate_summary(self, risk_level, symptoms):
        """Generate summary"""
        return f"Based on the symptoms provided, this appears to be a {risk_level} risk situation. {self._generate_risk_assessment(risk_level, symptoms)}."
    
    def _generate_next_action(self, risk_level):
        """Generate next action"""
        actions = {
            "emergency": "Call emergency services immediately (911/999)",
            "high": "Contact healthcare provider within 2-4 hours or visit urgent care",
            "moderate": "Schedule appointment with doctor within 24-48 hours",
            "low": "Continue home care and contact doctor if symptoms worsen"
        }
        return actions.get(risk_level, "Contact healthcare provider for guidance")
    def analyze_symptoms(self, data):
        """Analyze symptoms using mock AI logic"""
        age = data.get('age', 30)
        symptoms = data.get('symptoms', '').lower()
        vitals = data.get('vitals', {})
        image_analysis = data.get('image_analysis', None)
        
        # Include image analysis in symptoms if available
        if image_analysis:
            symptoms += f" Image findings: {image_analysis.lower()}"
        
        # Determine risk level
        risk_level = self._determine_risk_level(symptoms, vitals, age)
        
        # Generate comprehensive response
        return {
            "level_1_reassurance": self._generate_reassurance(risk_level, symptoms),
            "level_2_assessment": {
                "severity": risk_level,
                "description": self._generate_risk_assessment(risk_level, symptoms)
            },
            "level_3_possibilities": self._generate_conditions(symptoms, age, data.get('sex', 'unknown')),
            "level_4_first_aid": self._generate_first_aid(symptoms, risk_level),
            "level_5_danger_signs": self._generate_danger_signs(symptoms, age),
            "level_6_vitals_analysis": self._analyze_vitals(vitals, age),
            "level_7_summary": {
                "summary": self._generate_summary(risk_level, symptoms),
                "next_action": self._generate_next_action(risk_level)
            }
        }

class GPTOSS20BService:
    """GPT-OSS-20B model integration service using Hugging Face Inference Providers"""
    
    def __init__(self):
        """Initialize GPT-OSS-20B service"""
        self.model_name = "openai/gpt-oss-20b:fireworks-ai"
        self.client = None
        self.use_local = False
        
        # Try to initialize with Hugging Face Inference Providers first
        try:
            # Check for HF_TOKEN environment variable
            if "HF_TOKEN" in os.environ and OpenAI:
                self.client = OpenAI(
                    base_url="https://router.huggingface.co/v1",
                    api_key=os.environ["HF_TOKEN"]
                )
                print("Using Hugging Face Inference Providers for GPT-OSS-20B")
            else:
                # Try local transformers
                self._init_local_model()
        except ImportError:
            print("OpenAI client not available, trying local transformers...")
            self._init_local_model()
        except Exception as e:
            print(f"Error with Inference Providers: {e}")
            self._init_local_model()
    
    def _init_local_model(self):
        """Initialize local transformers model"""
        try:
            if not TRANSFORMERS_AVAILABLE or pipeline is None:
                raise ImportError("Transformers not available")
                
            print("Loading local GPT-OSS-20B model...")
            self.pipe = pipeline(
                "text-generation",
                model="openai/gpt-oss-20b",
                torch_dtype=torch.float16 if torch is not None else None,
                device_map="auto"
            )
            self.use_local = True
            print("Local GPT-OSS-20B model loaded successfully")
        except Exception as e:
            print(f"Failed to load local model: {e}")
            raise RuntimeError("Both Inference Providers and local model failed")
    
    def _create_prompt(self, data):
        """Create comprehensive medical triage prompt"""
        age = data.get('age', 'unknown')
        sex = data.get('sex', 'unknown')
        symptoms = data.get('symptoms', '')
        duration = data.get('duration', 'unknown')
        vitals = data.get('vitals', {})
        image_analysis = data.get('image_analysis', None)
        
        prompt = f"""You are an expert medical triage AI assistant. Analyze the following patient information and provide a comprehensive 7-level triage assessment.

Patient Information:
- Age: {age} years
- Sex: {sex}
- Symptoms: {symptoms}
- Duration: {duration}
"""

        if vitals and vitals.get('temperature'):
            prompt += f"- Temperature: {vitals['temperature']}°C\n"
        if vitals and vitals.get('heart_rate'):
            prompt += f"- Heart Rate: {vitals['heart_rate']} BPM\n"
        
        if image_analysis:
            prompt += f"- Image Analysis: {image_analysis}\n"

        prompt += """
Please provide a comprehensive medical assessment in the following 7 levels:

**Level 1 - Reassurance Level**: Provide reassurance for mild symptoms and general advice.

**Level 2 - Initial Assessment**: Classify the condition severity (mild/moderate/severe/emergency).

**Level 3 - Pathological Possibilities**: List the 3-5 most likely medical conditions based on symptoms.

**Level 4 - First Aid Measures**: Provide specific first aid instructions that can be done at home.

**Level 5 - Danger Signs Alert**: List critical warning signs that require immediate medical attention.

**Level 6 - Vital Signs Analysis**: Analyze any provided vital signs and their implications.

**Level 7 - Summary Report & Next Action**: Provide a concise summary and specific next steps.

Format your response as a JSON object with these exact keys:
{
  "level_1_reassurance": "string",
  "level_2_assessment": {"severity": "mild|moderate|severe|emergency", "description": "string"},
  "level_3_possibilities": ["condition1", "condition2", "condition3"],
  "level_4_first_aid": ["step1", "step2", "step3"],
  "level_5_danger_signs": ["sign1", "sign2", "sign3"],
  "level_6_vitals_analysis": "string",
  "level_7_summary": {"summary": "string", "next_action": "string"}
}

Be precise, medically accurate, and prioritize patient safety."""

        return prompt
    
    def _parse_response(self, response_text):
        """Parse and validate response from GPT-OSS-20B"""
        try:
            # Try to extract JSON from response
            import json
            import re
            
            # Look for JSON object in the response
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            
            # Fallback: create structured response
            return self._create_fallback_response()
            
        except Exception as e:
            print(f"Error parsing response: {e}")
            return self._create_fallback_response()
    
    def _create_fallback_response(self):
        """Create fallback response when parsing fails"""
        return {
            "level_1_reassurance": "Unable to provide detailed analysis. Please consult a healthcare professional.",
            "level_2_assessment": {"severity": "moderate", "description": "Unable to assess - requires professional evaluation"},
            "level_3_possibilities": ["Requires medical assessment"],
            "level_4_first_aid": ["Monitor symptoms", "Stay hydrated", "Rest"],
            "level_5_danger_signs": ["Severe worsening", "Difficulty breathing", "Loss of consciousness"],
            "level_6_vitals_analysis": "Unable to analyze vitals without complete information",
            "level_7_summary": {
                "summary": "Analysis incomplete - seek medical advice",
                "next_action": "Contact healthcare provider for proper assessment"
            }
        }
    
    def analyze_symptoms(self, data):
        """Main method to analyze symptoms using GPT-OSS-20B"""
        prompt = self._create_prompt(data)
        
        try:
            if self.client and not self.use_local:
                # Use Hugging Face Inference Providers
                response = self.client.chat.completions.create(
                    model=self.model_name,
                    messages=[{"role": "user", "content": prompt}],
                    max_tokens=1000,
                    temperature=0.1
                )
                response_text = response.choices[0].message.content
            else:
                # Use local transformers
                messages = [{"role": "user", "content": prompt}]
                response = self.pipe(
                    messages,
                    max_new_tokens=1000,
                    temperature=0.1,
                    return_full_text=False
                )
                response_text = response[0]["generated_text"]
            
            return self._parse_response(response_text)
            
        except Exception as e:
            print(f"Error in GPT-OSS-20B analysis: {e}")
            # Fallback to mock service behavior
            mock_service = MockAIService()
            return mock_service.analyze_symptoms(data)

class GeminiVisionService:
    """Medical image analysis service using Google Gemini 2.5 Flash"""
    
    def __init__(self):
        """Initialize Gemini vision service"""
        from google import genai
        
        # Get API key from environment
        self.gemini_api_key = os.getenv('GEMINI_API_KEY')
        if not self.gemini_api_key:
            raise RuntimeError("GEMINI_API_KEY not found in environment variables")
        
        # Initialize Gemini client
        try:
            # Set the API key as environment variable for the client
            os.environ['GEMINI_API_KEY'] = self.gemini_api_key
            self.client = genai.Client()
            print("Gemini Vision service initialized successfully with Gemini 2.0 Flash")
        except Exception as e:
            print(f"Failed to initialize Gemini client: {e}")
            raise RuntimeError(f"Gemini initialization failed: {e}")
    
    def analyze_image(self, image_data, prompt="What do you see in this medical image? Describe any visible symptoms, conditions, wounds, rashes, swelling, discoloration, or medical findings in detail."):
        """Analyze medical image using Gemini 2.5 Flash vision model"""
        
        if not image_data:
            return {
                "success": False,
                "error": "No image data provided",
                "user_message": "No image was uploaded for analysis."
            }
        
        try:
            from google.genai import types
            
            # Create image part from bytes
            image_part = types.Part.from_bytes(
                data=image_data,
                mime_type='image/jpeg'
            )
            
            # Generate content with medical-focused prompt
            response = self.client.models.generate_content(
                model='gemini-2.0-flash',
                contents=[
                    image_part,
                    prompt
                ],
                config=types.GenerateContentConfig(
                    thinking_config=types.ThinkingConfig(thinking_budget=0)  # Disable thinking for faster response
                )
            )
            
            if response and response.text:
                return {
                    "success": True,
                    "analysis": response.text.strip(),
                    "model": "gemini-2.0-flash"
                }
            else:
                return {
                    "success": False,
                    "error": "Empty response from Gemini",
                    "user_message": "Image analysis returned no results. Please describe any visible symptoms manually."
                }
                
        except Exception as e:
            error_msg = f"Gemini analysis error: {str(e)}"
            print(f"Gemini Vision Error: {error_msg}")
            return {
                "success": False,
                "error": error_msg,
                "user_message": f"Image analysis failed: {str(e)}. Please describe any visible symptoms, wounds, rashes, or medical findings manually."
            }
    
    def _get_image_info(self, image_bytes):
        """Get basic information about the uploaded image"""
        try:
            image = Image.open(io.BytesIO(image_bytes))
            return {
                "format": image.format or "Unknown",
                "size": f"{image.width}x{image.height}",
                "mode": image.mode,
                "file_size_kb": len(image_bytes) // 1024
            }
        except Exception:
            return {
                "format": "Unknown",
                "size": "Unknown",
                "mode": "Unknown",
                "file_size_kb": 0
            }
    
    def process_image_file(self, image_file):
        """Process uploaded image file and provide basic info"""
        try:
            # Open and process the image
            image = Image.open(io.BytesIO(image_file))
            
            # Convert to RGB if necessary
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Resize if too large (max 1024x1024 for efficiency)
            max_size = 1024
            if image.width > max_size or image.height > max_size:
                image.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
            
            # Convert to bytes
            img_byte_arr = io.BytesIO()
            image.save(img_byte_arr, format='JPEG', quality=85)
            img_byte_arr = img_byte_arr.getvalue()
            
            return {
                "success": True,
                "image_data": img_byte_arr,
                "format": "JPEG",
                "size": f"{image.width}x{image.height}",
                "file_size_kb": len(img_byte_arr) // 1024
            }
            
        except Exception as e:
            error_msg = f"Error processing image file: {str(e)}"
            print(f"Image Processing Error: {error_msg}")
            return {
                "success": False,
                "error": error_msg
            }

# Initialize AI service with fallback
ai_service: Optional[Any] = None
image_service: Optional[GeminiVisionService] = None

# Initialize GPT-OSS-20B service
try:
    ai_service = GPTOSS20BService()
    print("GPT-OSS-20B service initialized successfully!")
except Exception as e:
    print(f"Failed to initialize GPT-OSS-20B service: {e}")
    print("Falling back to mock AI service...")
    ai_service = MockAIService()

# Initialize Gemini Vision service
try:
    image_service = GeminiVisionService()
    print("Gemini Vision service initialized successfully!")
except Exception as e:
    print(f"Failed to initialize Gemini Vision service: {e}")
    print("Image analysis will not be available.")
    image_service = None

# Comprehensive medical triage prompt
def create_triage_prompt(age, sex, symptoms, duration, vitals=None, image_analysis=None):
    """Create a comprehensive medical triage prompt"""
    
    prompt = f"""You are an expert medical triage AI assistant. Analyze the following patient information and provide a comprehensive 7-level triage assessment.

Patient Information:
- Age: {age} years
- Sex: {sex}
- Symptoms: {symptoms}
- Duration: {duration}
"""

    if vitals and vitals.get('temperature'):
        prompt += f"- Temperature: {vitals['temperature']}°C\n"
    if vitals and vitals.get('heart_rate'):
        prompt += f"- Heart Rate: {vitals['heart_rate']} BPM\n"
    
    if image_analysis:
        prompt += f"- Image Analysis: {image_analysis}\n"

    prompt += """
Please provide a comprehensive medical assessment in the following 7 levels:

**Level 1 - Reassurance Level**: Provide reassurance for mild symptoms and general advice.

**Level 2 - Initial Assessment**: Classify the condition severity (mild/moderate/severe/emergency).

**Level 3 - Pathological Possibilities**: List the 3-5 most likely medical conditions based on symptoms.

**Level 4 - First Aid Measures**: Provide specific first aid instructions that can be done at home.

**Level 5 - Danger Signs Alert**: List critical warning signs that require immediate medical attention.

**Level 6 - Vital Signs Analysis**: Analyze any provided vital signs and their implications.

**Level 7 - Summary Report & Next Action**: Provide a concise summary and specific next steps.

Format your response as a JSON object with these exact keys:
{
  "level_1_reassurance": "string",
  "level_2_assessment": {"severity": "mild|moderate|severe|emergency", "description": "string"},
  "level_3_possibilities": ["condition1", "condition2", "condition3"],
  "level_4_first_aid": ["step1", "step2", "step3"],
  "level_5_danger_signs": ["sign1", "sign2", "sign3"],
  "level_6_vitals_analysis": "string",
  "level_7_summary": {"summary": "string", "next_action": "string"}
}

Be precise, medically accurate, and prioritize patient safety."""

    return prompt

# Emergency keywords detection
def detect_emergency_keywords(symptoms):
    """Detect emergency keywords in symptoms"""
    emergency_keywords = [
        'chest pain', 'severe bleeding', 'bleeding', 'blood', 'fainting', 'fainted', 'unconscious',
        'shortness of breath', 'can\'t breathe', 'difficulty breathing', 'stroke', 'heart attack',
        'seizure', 'convulsion', 'anaphylaxis', 'allergic reaction', 'poisoning', 'overdose',
        'suicide', 'drowning', 'choking', 'head injury', 'neck injury', 'spine injury', 'paralysis'
    ]
    
    symptoms_lower = symptoms.lower()
    detected = [keyword for keyword in emergency_keywords if keyword in symptoms_lower]
    return detected

# Image analysis endpoint
@app.route('/api/analyze_image', methods=['POST'])
def analyze_image():
    """Analyze uploaded image for medical symptoms"""
    try:
        # Check if image service is available
        if image_service is None:
            return jsonify({
                'error': 'Image analysis service not available',
                'fallback_message': 'Please describe any visible symptoms or medical findings in the text field.'
            }), 503
        
        # Check if file is in request
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({'error': 'No image file selected'}), 400
        
        # Check file type
        allowed_extensions = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'}
        if file.filename is None or '.' not in file.filename:
            file_extension = ''
        else:
            file_extension = file.filename.rsplit('.', 1)[1].lower()
        
        if file_extension not in allowed_extensions:
            return jsonify({'error': 'Invalid file type. Please upload an image file.'}), 400
        
        # Read file data
        file_data = file.read()
        
        # Process image
        processing_result = image_service.process_image_file(file_data)
        if not processing_result['success']:
            return jsonify({
                'error': 'Failed to process image',
                'details': processing_result.get('error', 'Unknown error')
            }), 400
        
        # Get optional custom prompt
        custom_prompt = request.form.get('prompt', 'What do you see in this medical image? Describe any symptoms, conditions, rashes, wounds, or medical findings visible. Focus on medically relevant observations.')
        
        # Analyze image
        analysis_result = image_service.analyze_image(
            processing_result['image_data'], 
            custom_prompt
        )
        
        if analysis_result['success']:
            response = {
                'success': True,
                'analysis': analysis_result['analysis'],
                'model': analysis_result['model'],
                'image_info': {
                    'format': processing_result['format'],
                    'size': processing_result['size']
                }
            }
        else:
            response = {
                'success': False,
                'error': analysis_result.get('error', 'Analysis failed'),
                'fallback_analysis': analysis_result.get('fallback_analysis', 'Please describe visible symptoms manually.')
            }
        
        return jsonify(response)
        
    except Exception as e:
        return jsonify({
            'error': f'Unexpected error during image analysis: {str(e)}',
            'fallback_message': 'Please describe any visible symptoms or medical findings in the text field.'
        }), 500

# Analyze triage endpoint
@app.route('/api/analyze', methods=['POST'])
def analyze_triage():
    """Analyze patient symptoms and provide triage recommendations"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['age', 'sex', 'symptoms', 'duration']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Ensure ai_service is available
        if ai_service is None:
            return jsonify({'error': 'AI service not available'}), 503
            
        # Check if ai_service has the analyze_symptoms method
        if not hasattr(ai_service, 'analyze_symptoms'):
            return jsonify({'error': 'AI service does not support symptom analysis'}), 503
        
        # Add image analysis if provided
        if 'image_analysis' in data and data['image_analysis']:
            # Image analysis has been performed, include it in the data
            print(f"Including image analysis in symptom evaluation: {data['image_analysis'][:100]}...")
            print(f"Full image analysis data received: {data['image_analysis']}")
        
        # Use AI service for analysis
        print(f"Using AI service: {type(ai_service).__name__}")
        analysis = ai_service.analyze_symptoms(data)
        print(f"AI service returned analysis with keys: {list(analysis.keys()) if analysis else 'None'}")
        
        # Format response to match expected structure
        response = {
            "risk_level": analysis["level_2_assessment"]["severity"],
            "risk_assessment": analysis["level_2_assessment"]["description"],
            "possible_conditions": analysis["level_3_possibilities"],
            "first_aid_measures": analysis["level_4_first_aid"],
            "immediate_actions": [analysis["level_7_summary"]["next_action"]],
            "danger_signs": analysis["level_5_danger_signs"],
            "vitals_analysis": [analysis["level_6_vitals_analysis"]],
            "timeline_recommendations": {
                "Next 24 hours": ["Monitor symptoms closely", "Follow recommended first aid measures"],
                "Next 48 hours": ["Reassess condition", "Contact healthcare provider if needed"],
                "Next week": ["Follow up as recommended", "Complete any prescribed treatments"]
            }
        }
        
        # Add image analysis info if available
        if 'image_analysis' in data and data['image_analysis']:
            response["image_analysis_included"] = True
            response["image_findings"] = data['image_analysis']
            print(f"Added image analysis to response: {data['image_analysis'][:100]}...")
        else:
            print("No image analysis data found in request data")
            print(f"Request data keys: {list(data.keys())}")
        
        print(f"Final response keys: {list(response.keys())}")
        return jsonify(response)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    """Check if the AI services are loaded and ready"""
    try:
        services_status = {
            "ai_service": {
                "available": ai_service is not None and hasattr(ai_service, 'analyze_symptoms'),
                "model": getattr(ai_service, 'model_name', 'mock') if ai_service else None
            },
            "image_service": {
                "available": image_service is not None,
                "model": getattr(image_service, 'model_name', None) if image_service else None
            }
        }
        
        # Determine overall status
        if services_status["ai_service"]["available"]:
            overall_status = "healthy"
            status_message = "Primary AI service ready"
            if services_status["image_service"]["available"]:
                status_message += " with image analysis"
            else:
                status_message += " (image analysis unavailable)"
        else:
            overall_status = "service_unavailable"
            status_message = "AI service not ready"
        
        response = {
            "status": overall_status,
            "message": status_message,
            "services": services_status
        }
        
        return jsonify(response), 200 if overall_status == "healthy" else 503
        
    except Exception as e:
        return jsonify({
            "status": "error",
            "error": str(e)
        }), 500

# Serve static files
@app.route('/css/<path:filename>')
def serve_css(filename):
    """Serve CSS files"""
    from flask import send_from_directory
    return send_from_directory('css', filename)

@app.route('/js/<path:filename>')
def serve_js(filename):
    """Serve JS files"""
    from flask import send_from_directory
    return send_from_directory('js', filename)

# Serve the frontend
@app.route('/')
def serve_frontend():
    """Serve the main HTML page"""
    with open('index.html', 'r', encoding='utf-8') as f:
        return f.read()

if __name__ == '__main__':
    print("Starting MeHelper Flask server...")
    print("Mock AI service initialized successfully!")
    print("Server running on http://localhost:5000")
    app.run(debug=False, host='0.0.0.0', port=5000, use_reloader=False)