import React, { useState, useEffect } from 'react';
import { AlertCircle, TrendingUp, MapPin, Clock, Activity, BarChart3, RefreshCw } from 'lucide-react';

function App() {
  const [issues, setIssues] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [error, setError] = useState(null);
  const [useBackend, setUseBackend] = useState(true); // Toggle for demo

  // Backend API URL
  const API_URL = 'http://127.0.0.1:5000';

  // Fetch data from backend
  const fetchDataFromBackend = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Call the /api/analyze endpoint
      const analyzeResponse = await fetch(`${API_URL}/api/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!analyzeResponse.ok) {
        throw new Error('Failed to fetch from backend');
      }
      
      const analyzeData = await analyzeResponse.json();
      
      // Call the /api/stats endpoint
      const statsResponse = await fetch(`${API_URL}/api/stats`);
      const statsData = await statsResponse.json();
      
      // Update state with real backend data
      setIssues(analyzeData.issues);
      setStats(statsData);
      setLoading(false);
      
      console.log('✅ Data fetched from backend successfully!');
      console.log('Issues:', analyzeData.issues);
      console.log('Stats:', statsData);
      
    } catch (err) {
      console.error('❌ Backend connection error:', err);
      setError('Could not connect to backend. Using mock data instead.');
      
      // Fallback to mock data if backend fails
      loadMockData();
    }
  };

  // Mock data fallback
  const loadMockData = () => {
    const mockIssues = [
      {
        id: 1001,
        original_text: "FIRE in Chawkbazar area! Need immediate help! 🔥🔥",
        category: "fire emergency",
        confidence: 98.5,
        severity: 95,
        location: "Chawkbazar, Dhaka",
        timestamp: "2025-11-04T16:30:00",
        status: "pending"
      },
      {
        id: 1002,
        original_text: "Flood water entering homes in Demra. Emergency situation!",
        category: "flood",
        confidence: 96.2,
        severity: 90,
        location: "Demra, Dhaka",
        timestamp: "2025-11-04T15:00:00",
        status: "pending"
      },
      {
        id: 1003,
        original_text: "বিদ্যুৎ নেই গত ৬ ঘন্টা। এই গরমে অসহ্য। Load shedding unbearable",
        category: "electricity outage",
        confidence: 94.8,
        severity: 75,
        location: "Uttara, Dhaka",
        timestamp: "2025-11-04T14:20:00",
        status: "pending"
      },
      {
        id: 1004,
        original_text: "আমাদের এলাকায় ৩ দিন ধরে পানি নেই। Water crisis in Mirpur",
        category: "water supply",
        confidence: 93.1,
        severity: 70,
        location: "Mirpur, Dhaka",
        timestamp: "2025-11-04T10:30:00",
        status: "pending"
      },
      {
        id: 1005,
        original_text: "Road accident near Science Lab. Need ambulance immediately!",
        category: "medical emergency",
        confidence: 97.3,
        severity: 85,
        location: "Science Lab, Dhaka",
        timestamp: "2025-11-04T13:20:00",
        status: "pending"
      },
      {
        id: 1006,
        original_text: "Broken road near Dhanmondi 27. Accident happened yesterday.",
        category: "road damage",
        confidence: 91.7,
        severity: 65,
        location: "Dhanmondi, Dhaka",
        timestamp: "2025-11-04T11:15:00",
        status: "pending"
      },
      {
        id: 1007,
        original_text: "Garbage not collected for 2 weeks. Smell is terrible!",
        category: "garbage collection",
        confidence: 89.4,
        severity: 60,
        location: "Gulshan, Dhaka",
        timestamp: "2025-11-04T09:00:00",
        status: "pending"
      },
      {
        id: 1008,
        original_text: "Gas pressure very low. Can't cook food. Help needed urgently",
        category: "gas supply",
        confidence: 88.2,
        severity: 55,
        location: "Banani, Dhaka",
        timestamp: "2025-11-04T12:45:00",
        status: "pending"
      }
    ];

    const mockStats = {
      total_issues: 8,
      high_severity: 3,
      categories: {
        "fire emergency": 1,
        "flood": 1,
        "electricity outage": 1,
        "water supply": 1,
        "medical emergency": 1,
        "road damage": 1,
        "garbage collection": 1,
        "gas supply": 1
      },
      locations: 8
    };

    setIssues(mockIssues);
    setStats(mockStats);
    setLoading(false);
  };

  // Initial load
  useEffect(() => {
    if (useBackend) {
      fetchDataFromBackend();
    } else {
      loadMockData();
    }
  }, [useBackend]);

  const getSeverityColor = (severity) => {
    if (severity >= 80) return 'bg-red-500';
    if (severity >= 60) return 'bg-orange-500';
    return 'bg-yellow-500';
  };

  const getSeverityBadge = (severity) => {
    if (severity >= 80) return 'bg-red-100 text-red-800 border-red-200';
    if (severity >= 60) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'fire emergency': '🔥',
      'flood': '🌊',
      'electricity outage': '⚡',
      'water supply': '💧',
      'medical emergency': '🚑',
      'road damage': '🚧',
      'garbage collection': '🗑️',
      'gas supply': '🔥',
      'crime/safety': '🚨'
    };
    return icons[category] || '📢';
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000 / 60); // minutes
    
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  const filteredIssues = selectedCategory === 'all' 
    ? issues 
    : issues.filter(i => i.category === selectedCategory);

  const refreshData = () => {
    if (useBackend) {
      fetchDataFromBackend();
    } else {
      loadMockData();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">
            {useBackend ? 'Connecting to AI Backend...' : 'Loading CivicPulse AI...'}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {useBackend ? 'Running NLP analysis on posts' : 'Analyzing civic issues'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border-t-4 border-blue-600">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                🌐 CivicPulse AI
              </h1>
              <p className="text-gray-600 text-sm md:text-base">
                AI-Powered Civic Issue Detection & Monitoring System
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Built by Team Zephyr AI • East West University
              </p>
              {/* Status Badge */}
              <div className="flex items-center gap-2 mt-2">
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                  useBackend 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    useBackend ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'
                  }`}></div>
                  {useBackend ? 'Connected to AI Backend' : 'Using Mock Data'}
                </div>
                {error && (
                  <span className="text-xs text-red-600">⚠️ {error}</span>
                )}
              </div>
            </div>
            <div className="flex gap-2 mt-4 md:mt-0">
              {/* Toggle Backend/Mock */}
              <button
                onClick={() => setUseBackend(!useBackend)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all shadow-lg text-sm"
              >
                {useBackend ? '🤖 Backend Mode' : '📦 Mock Mode'}
              </button>
              <button
                onClick={refreshData}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
              >
                <RefreshCw size={20} />
                Refresh Data
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Issues</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.total_issues || 0}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <BarChart3 className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">High Severity</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.high_severity || 0}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <AlertCircle className="text-red-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Categories</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {stats?.categories ? Object.keys(stats.categories).length : 0}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Activity className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Locations</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.locations || 0}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <MapPin className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Issues
            </button>
            {stats?.categories && Object.keys(stats.categories).map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{getCategoryIcon(cat)}</span>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Issues List */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <TrendingUp className="text-blue-600" />
            Detected Issues ({filteredIssues.length})
            {useBackend && <span className="text-sm font-normal text-green-600">• AI Analyzed</span>}
          </h2>
          
          <div className="space-y-4">
            {filteredIssues.map(issue => (
              <div
                key={issue.id}
                className="border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all bg-gradient-to-r from-white to-gray-50"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <span className="text-3xl">{getCategoryIcon(issue.category)}</span>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="text-lg font-bold text-gray-900 capitalize">
                            {issue.category}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getSeverityBadge(issue.severity)}`}>
                            Severity: {issue.severity}/100
                          </span>
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                            {issue.confidence}% confidence
                          </span>
                        </div>
                        <p className="text-gray-700 mb-3 leading-relaxed">
                          {issue.original_text}
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <MapPin size={16} className="text-gray-400" />
                            <span>{issue.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock size={16} className="text-gray-400" />
                            <span>{formatTimestamp(issue.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <div className="w-full md:w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getSeverityColor(issue.severity)}`}
                        style={{ width: `${issue.severity}%` }}
                      ></div>
                    </div>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm font-medium shadow-md hover:shadow-lg">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto mt-8 text-center text-gray-600 text-sm">
        <p>🤖 Powered by AI/ML | Built with React + NLP | Team Zephyr AI</p>
        <p className="mt-1">Transforming social media insights into actionable civic solutions</p>
      </div>
    </div>
  );
}

export default App;