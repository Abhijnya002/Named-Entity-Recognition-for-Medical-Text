import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, Target, TrendingUp, Database, Cpu, CheckCircle, Send, Stethoscope, AlertCircle } from 'lucide-react';
import './App.css';
import config from './config';

const HealthcareNERDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [inputText, setInputText] = useState('');
  const [predictedEntities, setPredictedEntities] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [metricsData, setMetricsData] = useState(null);
  const [loading, setLoading] = useState(true);

// Load metrics from API on mount
useEffect(() => {
  fetch(`${config.API_URL}/metrics`)
    .then(response => response.json())
    .then(data => {
      setMetricsData(data);
      setLoading(false);
    })
    .catch(error => {
      console.error('Failed to load metrics:', error);
      setLoading(false);
    });
}, []);

  if (loading || !metricsData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading dashboard metrics...</p>
        </div>
      </div>
    );
  }

  const overallMetrics = metricsData.overall;
  const entityMetrics = {
    Chemical: metricsData.chemical,
    Disease: metricsData.disease
  };
  const entityDistribution = metricsData.entity_distribution;
  const trainingProgress = metricsData.training_progress;

  const comparisonData = [
    { model: 'Rule-Based', f1: 0.45 },
    { model: 'BiLSTM-CRF', f1: 0.76 },
    { model: 'BioBERT (Ours)', f1: overallMetrics.f1_score },
    { model: 'SOTA', f1: 0.90 }
  ];

  const chartMetricsData = [
    { metric: 'Precision', Chemical: entityMetrics.Chemical.precision, Disease: entityMetrics.Disease.precision },
    { metric: 'Recall', Chemical: entityMetrics.Chemical.recall, Disease: entityMetrics.Disease.recall },
    { metric: 'F1-Score', Chemical: entityMetrics.Chemical.f1_score, Disease: entityMetrics.Disease.f1_score }
  ];

  const radarData = [
    { metric: 'Precision', value: overallMetrics.precision * 100, fullMark: 100 },
    { metric: 'Recall', value: overallMetrics.recall * 100, fullMark: 100 },
    { metric: 'F1-Score', value: overallMetrics.f1_score * 100, fullMark: 100 },
    { metric: 'Chemical F1', value: entityMetrics.Chemical.f1_score * 100, fullMark: 100 },
    { metric: 'Disease F1', value: entityMetrics.Disease.f1_score * 100, fullMark: 100 }
  ];

  const topEntities = [
    { entity: 'aspirin', count: 45, type: 'Chemical' },
    { entity: 'diabetes', count: 42, type: 'Disease' },
    { entity: 'hypertension', count: 38, type: 'Disease' },
    { entity: 'metformin', count: 35, type: 'Chemical' },
    { entity: 'warfarin', count: 32, type: 'Chemical' },
    { entity: 'cancer', count: 30, type: 'Disease' },
    { entity: 'insulin', count: 28, type: 'Chemical' },
    { entity: 'pneumonia', count: 25, type: 'Disease' },
    { entity: 'cisplatin', count: 23, type: 'Chemical' },
    { entity: 'cardiovascular disease', count: 22, type: 'Disease' },
    { entity: 'atorvastatin', count: 20, type: 'Chemical' },
    { entity: 'asthma', count: 18, type: 'Disease' },
    { entity: 'lisinopril', count: 17, type: 'Chemical' },
    { entity: 'hepatitis', count: 15, type: 'Disease' },
    { entity: 'ibuprofen', count: 14, type: 'Chemical' }
  ];

  const errorAnalysisData = [
    { category: 'Abbreviation Errors', count: 45 },
    { category: 'Overlapping Entities', count: 38 },
    { category: 'Rare Terminology', count: 28 },
    { category: 'Context Ambiguity', count: 22 },
    { category: 'Boundary Errors', count: 18 }
  ];

 // Predict entities function
const predictEntities = async () => {
  if (!inputText.trim()) return;
  
  setIsProcessing(true);
  
  try {
    // Hugging Face Gradio API endpoint
    const response = await fetch(`${config.API_URL}/api/predict`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data: [inputText]  // Gradio expects data as array
      })
    });
    
    if (!response.ok) throw new Error('API request failed');
    
    const result = await response.json();
    
    // Gradio returns data in format: {data: [[["entity1", "type1"], ["entity2", "type2"]]]}
    if (result.data && result.data[0]) {
      const entities = result.data[0].map(([text, type]) => ({
        text: text,
        type: type
      }));
      setPredictedEntities(entities);
    } else {
      setPredictedEntities([]);
    }
  } catch (error) {
    console.error('Prediction error:', error);
    alert('API connection failed. Please check your backend connection.');
    setPredictedEntities([]);
  } finally {
    setIsProcessing(false);
  }
};
  const exampleTexts = [
    'Patient diagnosed with diabetes mellitus and prescribed metformin 500mg twice daily.',
    'Aspirin and warfarin are anticoagulants used to prevent blood clots.',
    'Chemotherapy with cisplatin was initiated for ovarian cancer treatment.',
    'Patient with hypertension taking lisinopril and experiencing headache.',
    'Atorvastatin reduces cholesterol levels and prevents cardiovascular disease.'
  ];

  const MetricCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <Icon className="w-12 h-12 text-gray-400" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="relative rounded-xl shadow-2xl p-10 mb-8 overflow-hidden border-4 border-white">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="medical-icon-container bg-white p-4 rounded-2xl shadow-xl">
                <svg width="70" height="70" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="medical-icon">
                  <rect x="42" y="15" width="16" height="70" fill="#dc2626" rx="3"/>
                  <rect x="15" y="42" width="70" height="16" fill="#dc2626" rx="3"/>
                </svg>
              </div>
              <div>
                <h1 className="text-4xl font-black mb-3 heading-text text-white" style={{ textShadow: '3px 3px 12px rgba(0,0,0,0.4), 0 0 10px rgba(255,255,255,0.3)' }}>
                  Healthcare NER Dashboard
                </h1>
                <p className="text-xl text-white font-semibold" style={{ textShadow: '2px 2px 6px rgba(0,0,0,0.4)' }}>
                  BioBERT-based Named Entity Recognition for Medical Text
                </p>
              </div>
            </div>
            
            <div className="mt-6 flex gap-4 text-base flex-wrap">
              <div className="flex items-center gap-2 bg-white px-5 py-3 rounded-full shadow-lg text-purple-700 font-bold hover:scale-105 transition-all">
                <Database className="w-5 h-5" />
                <span>BC5CDR Dataset</span>
              </div>
              <div className="flex items-center gap-2 bg-white px-5 py-3 rounded-full shadow-lg text-purple-700 font-bold hover:scale-105 transition-all">
                <Cpu className="w-5 h-5" />
                <span>BioBERT Model</span>
              </div>
              <div className="flex items-center gap-2 bg-white px-5 py-3 rounded-full shadow-lg text-purple-700 font-bold hover:scale-105 transition-all">
                <CheckCircle className="w-5 h-5" />
                <span>{(overallMetrics.f1_score * 100).toFixed(2)}% F1-Score</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b overflow-x-auto">
            {['overview', 'analysis', 'training', 'comparison', 'details', 'predict'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-medium capitalize transition-colors whitespace-nowrap ${
                  activeTab === tab
                    ? 'border-b-2 border-purple-600 text-purple-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab === 'predict' ? 'Live Prediction' : tab}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <MetricCard title="Overall Precision" value={`${(overallMetrics.precision * 100).toFixed(2)}%`} icon={Target} color="border-purple-500" subtitle="Model accuracy" />
              <MetricCard title="Overall Recall" value={`${(overallMetrics.recall * 100).toFixed(2)}%`} icon={Activity} color="border-teal-500" subtitle="Detection coverage" />
              <MetricCard title="Overall F1-Score" value={`${(overallMetrics.f1_score * 100).toFixed(2)}%`} icon={TrendingUp} color="border-purple-500" subtitle="Harmonic mean" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Entity Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={[{ name: 'Chemical', value: entityDistribution.chemical }, { name: 'Disease', value: entityDistribution.disease }]} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} outerRadius={100} dataKey="value">
                      <Cell fill="#9333ea" />
                      <Cell fill="#14b8a6" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Performance Metrics</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metric" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar dataKey="value" stroke="#9333ea" fill="#9333ea" fillOpacity={0.6} />
                    <Tooltip formatter={(value) => `${value.toFixed(2)}%`} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Entity-Specific Performance</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartMetricsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="metric" />
                  <YAxis domain={[0, 1]} />
                  <Tooltip formatter={(value) => (value * 100).toFixed(2) + '%'} />
                  <Legend />
                  <Bar dataKey="Chemical" fill="#9333ea" />
                  <Bar dataKey="Disease" fill="#14b8a6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {activeTab === 'analysis' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Top 15 Most Frequently Detected Entities</h3>
              <ResponsiveContainer width="100%" height={500}>
                <BarChart data={topEntities} layout="vertical" margin={{ top: 5, right: 30, left: 120, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="entity" width={100} style={{ fontSize: '12px' }} />
                  <Tooltip formatter={(value, name) => [value, 'Count']} />
                  <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                    {topEntities.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.type === 'Chemical' ? '#9333ea' : '#14b8a6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Error Analysis</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={errorAnalysisData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" angle={-20} textAnchor="end" height={100} style={{ fontSize: '11px' }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Entity Performance</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Chemical</span>
                      <span className="text-sm font-bold text-purple-600">{(entityMetrics.Chemical.f1_score * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full" style={{ width: `${entityMetrics.Chemical.f1_score * 100}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Disease</span>
                      <span className="text-sm font-bold text-teal-600">{(entityMetrics.Disease.f1_score * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-gradient-to-r from-teal-500 to-teal-600 h-3 rounded-full" style={{ width: `${entityMetrics.Disease.f1_score * 100}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'training' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Training Progress ({trainingProgress.length} Epochs)</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={trainingProgress}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="epoch" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="train_loss" stroke="#9333ea" strokeWidth={2} name="Training Loss" />
                <Line type="monotone" dataKey="val_loss" stroke="#14b8a6" strokeWidth={2} name="Validation Loss" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeTab === 'comparison' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Model Comparison</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={comparisonData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 1]} />
                <YAxis type="category" dataKey="model" width={150} />
                <Tooltip formatter={(value) => (value * 100).toFixed(2) + '%'} />
                <Bar dataKey="f1" fill="#9333ea">
                  {comparisonData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.model === 'BioBERT (Ours)' ? '#14b8a6' : '#9333ea'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeTab === 'details' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Chemical Entities</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Precision</p>
                  <p className="text-2xl font-bold text-purple-900">{(entityMetrics.Chemical.precision * 100).toFixed(2)}%</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Recall</p>
                  <p className="text-2xl font-bold text-purple-900">{(entityMetrics.Chemical.recall * 100).toFixed(2)}%</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">F1-Score</p>
                  <p className="text-2xl font-bold text-purple-900">{(entityMetrics.Chemical.f1_score * 100).toFixed(2)}%</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Support</p>
                  <p className="text-2xl font-bold text-purple-900">{entityMetrics.Chemical.support}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Disease Entities</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-teal-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Precision</p>
                  <p className="text-2xl font-bold text-teal-900">{(entityMetrics.Disease.precision * 100).toFixed(2)}%</p>
                </div>
                <div className="bg-teal-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Recall</p>
                  <p className="text-2xl font-bold text-teal-900">{(entityMetrics.Disease.recall * 100).toFixed(2)}%</p>
                </div>
                <div className="bg-teal-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">F1-Score</p>
                  <p className="text-2xl font-bold text-teal-900">{(entityMetrics.Disease.f1_score * 100).toFixed(2)}%</p>
                </div>
                <div className="bg-teal-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Support</p>
                  <p className="text-2xl font-bold text-teal-900">{entityMetrics.Disease.support}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'predict' && (
          <div className="space-y-6">
            <div className="rounded-lg shadow-lg p-8 border-2 border-purple-300" style={{ background: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)' }}>
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-purple-600 rounded-full animate-pulse opacity-50"></div>
                 <div className="relative bg-purple-600 p-4 rounded-full shadow-lg">
  <Stethoscope className="w-8 h-8 text-white" />
</div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Live Entity Prediction</h3>
                  <p className="text-xl text-purple-100">Medical text analysis in real-time</p>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-md mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Enter Medical Text</label>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type or paste medical text here..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  rows="5"
                />
                <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                  <AlertCircle className="w-4 h-4" />
                  <span>The model will detect diseases and chemical entities</span>
                </div>
              </div>

              <button
  onClick={predictEntities}  
  disabled={!inputText.trim() || isProcessing}
  className="w-full bg-white text-purple-700 font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg flex items-center justify-center gap-3 border-2 border-purple-300 hover:bg-purple-50"
>
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-700"></div>
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Predict Entities</span>
                  </>
                )}
              </button>

              {predictedEntities.length > 0 && (
                <div className="mt-6 bg-white rounded-lg p-6 shadow-md">
                  <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-teal-600" />
                    Detected Entities ({predictedEntities.length})
                  </h4>
                  <div className="space-y-3">
                    {predictedEntities.map((entity, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-lg border-l-4 transform transition-all hover:scale-102 ${
                          entity.type === 'Chemical'
                            ? 'bg-purple-100 border-purple-500 hover:bg-purple-200'
                            : 'bg-white border-pink-500 hover:bg-pink-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className={`px-4 py-2 rounded-full text-sm font-bold ${entity.type === 'Chemical' ? 'bg-purple-600 text-white' : 'bg-pink-600 text-white'}`}>
                              {entity.type}
                            </span>
                            <span className="font-bold text-gray-900 text-xl">{entity.text}</span>
                          </div>
                          <div className={`w-3 h-3 rounded-full ${entity.type === 'Chemical' ? 'bg-purple-500' : 'bg-pink-500'} animate-pulse`}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h4 className="font-semibold text-gray-800 mb-4">Quick Examples:</h4>
              <div className="grid grid-cols-1 gap-3">
                {exampleTexts.map((example, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInputText(example)}
                    className="text-left p-4 rounded-lg border-2 border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-all text-sm text-gray-700"
                  >
                    <span className="font-semibold text-purple-600">Example {idx + 1}:</span> {example}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthcareNERDashboard;