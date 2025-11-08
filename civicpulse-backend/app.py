import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import pipeline
import re
from datetime import datetime
import random

app = Flask(__name__)
CORS(app)

# Initialize AI model - using smaller model for deployment
# Use bart-base instead of bart-large to reduce memory usage
MODEL_NAME = os.getenv("MODEL_NAME", "facebook/bart-base")
classifier = None  # Lazy load on first request

def get_classifier():
    """Lazy load classifier to save memory"""
    global classifier
    if classifier is None:
        print("📊 Loading AI Model (first request)...")
        classifier = pipeline("zero-shot-classification", model=MODEL_NAME)
        print("✅ Model loaded!")
    return classifier

# Issue categories
CATEGORIES = [
    "water supply",
    "electricity outage", 
    "road damage",
    "garbage collection",
    "gas supply",
    "flood",
    "fire emergency",
    "medical emergency",
    "crime/safety"
]

# Mock social media posts database (simulating FB posts)
MOCK_POSTS = [
    {"text": "আমাদের এলাকায় ৩ দিন ধরে পানি নেই। কেউ কিছু করছে না। Water crisis in Mirpur", "location": "Mirpur, Dhaka", "timestamp": "2025-11-04T10:30:00"},
    {"text": "Broken road near Dhanmondi 27. Accident happened yesterday. Very dangerous!", "location": "Dhanmondi, Dhaka", "timestamp": "2025-11-04T11:15:00"},
    {"text": "বিদ্যুৎ নেই গত ৬ ঘন্টা। এই গরমে অসহ্য। Load shedding unbearable", "location": "Uttara, Dhaka", "timestamp": "2025-11-04T14:20:00"},
    {"text": "Garbage not collected for 2 weeks. Smell is terrible. Health hazard!", "location": "Gulshan, Dhaka", "timestamp": "2025-11-04T09:00:00"},
    {"text": "Gas pressure very low. Can't cook food. Help needed urgently", "location": "Banani, Dhaka", "timestamp": "2025-11-04T12:45:00"},
    {"text": "FIRE in Chawkbazar area! Need immediate help! 🔥🔥", "location": "Chawkbazar, Dhaka", "timestamp": "2025-11-04T16:30:00"},
    {"text": "Flood water entering homes in Demra. Emergency situation!", "location": "Demra, Dhaka", "timestamp": "2025-11-04T15:00:00"},
    {"text": "Road accident near Science Lab. Need ambulance immediately!", "location": "Science Lab, Dhaka", "timestamp": "2025-11-04T13:20:00"},
]

def calculate_severity(text, category):
    """Calculate severity score based on keywords and category"""
    emergency_keywords = ['emergency', 'urgent', 'immediately', 'help', 'fire', 'flood', 'accident', 'crisis']
    duration_keywords = ['days', 'weeks', 'hours', 'দিন', 'সপ্তাহ']
    
    text_lower = text.lower()
    severity = 50  # Base severity
    
    # Emergency keywords boost
    if any(word in text_lower for word in emergency_keywords):
        severity += 30
    
    # Duration mentions (longer = more severe)
    if any(word in text_lower for word in duration_keywords):
        severity += 15
    
    # Category-based severity
    high_priority_categories = ['fire emergency', 'medical emergency', 'flood', 'crime/safety']
    if category in high_priority_categories:
        severity += 25
    
    # Exclamation marks and emojis indicate urgency
    severity += min(text.count('!') * 3, 10)
    
    return min(severity, 100)  # Cap at 100

@app.route('/api/analyze', methods=['POST'])
def analyze_posts():
    """Analyze posts and classify civic issues"""
    try:
        # In real scenario, this would fetch from social media API
        # For demo, we use mock data
        posts = MOCK_POSTS
        
        analyzed_results = []
        
        for post in posts:
            # Use AI to classify the post
            clf = get_classifier()
            result = clf(post['text'], candidate_labels=CATEGORIES)
            
            top_category = result['labels'][0]
            confidence = result['scores'][0]
            
            # Calculate severity
            severity = calculate_severity(post['text'], top_category)
            
            analyzed_results.append({
                'id': random.randint(1000, 9999),
                'original_text': post['text'],
                'category': top_category,
                'confidence': round(confidence * 100, 2),
                'severity': severity,
                'location': post['location'],
                'timestamp': post['timestamp'],
                'status': 'pending'
            })
        
        # Sort by severity (highest first)
        analyzed_results.sort(key=lambda x: x['severity'], reverse=True)
        
        return jsonify({
            'success': True,
            'total_issues': len(analyzed_results),
            'issues': analyzed_results,
            'timestamp': datetime.now().isoformat()
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/stats', methods=['GET'])
def get_statistics():
    """Get dashboard statistics"""
    posts = MOCK_POSTS
    
    # Analyze all posts for stats
    category_counts = {}
    high_severity_count = 0
    
    for post in posts:
        clf = get_classifier()
        result = clf(post['text'], candidate_labels=CATEGORIES)
        category = result['labels'][0]
        severity = calculate_severity(post['text'], category)
        
        category_counts[category] = category_counts.get(category, 0) + 1
        if severity > 70:
            high_severity_count += 1
    
    return jsonify({
        'total_issues': len(posts),
        'high_severity': high_severity_count,
        'categories': category_counts,
        'locations': len(set(p['location'] for p in posts)),
        'last_updated': datetime.now().isoformat()
    })

@app.route('/', methods=['GET'])
def home():
    """Root endpoint"""
    return jsonify({
        'message': 'CivicPulse AI Backend is running!',
        'status': 'active',
        'endpoints': {
            'analyze': '/api/analyze (POST)',
            'stats': '/api/stats (GET)',
            'health': '/api/health (GET)'
        }
    })

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'service': 'CivicPulse AI'})

if __name__ == '__main__':
    print("🚀 CivicPulse AI Backend Starting...")
    print("📊 Waiting for first request to load model...")  # Lazy loading to save memory
    
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)