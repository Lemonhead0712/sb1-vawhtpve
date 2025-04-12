import React, { useState } from 'react';
import { LineChart as LucideLineChart, BarChart as LucideBarChart, Brain, Heart, MessageSquare, Users, ArrowRight, ArrowLeft, AlertTriangle, Shield, CheckCircle, XCircle, Download, Save, Trash2, AlertCircle, Upload, Clock, Sparkles } from 'lucide-react';
import { useSubjects } from '../context/SubjectsContext';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, AreaChart, Area, BarChart, Bar } from 'recharts';

interface MessagePosition {
  isRight: boolean;
  content: string;
  timestamp: Date;
}

interface AnalysisResult {
  category: string;
  subjectAScore: number;
  subjectBScore: number;
  comparison: string;
  individualInsights: {
    subjectA: string[];
    subjectB: string[];
  };
  messagePatterns?: {
    subjectA: MessagePosition[];
    subjectB: MessagePosition[];
  };
}

interface GottmanAnalysis {
  horseman: string;
  icon: React.ElementType;
  description: string;
  presence: 'low' | 'moderate' | 'high';
  examples: string[];
  recommendations: string[];
}

export default function Analysis() {
  const navigate = useNavigate();
  const { subjectA, subjectB } = useSubjects();
  const partnerA = subjectA || 'Partner A';
  const partnerB = subjectB || 'Partner B';
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [results, setResults] = useState<AnalysisResult[]>([
    {
      category: "Communication Style",
      subjectAScore: 75,
      subjectBScore: 82,
      comparison: `${partnerA} tends to be more direct and assertive (messages on right), while ${partnerB} shows a more diplomatic approach (messages on left). This creates a balanced dynamic in most conversations.`,
      individualInsights: {
        subjectA: [
          "Direct communication style, evident from right-aligned messages",
          "Clear expression of needs with quick responses",
          "Sometimes too assertive in message timing"
        ],
        subjectB: [
          "Diplomatic approach shown in left-aligned responses",
          "Strong listening skills demonstrated by thoughtful delays",
          "Effective mediator in discussions"
        ]
      },
      messagePatterns: {
        subjectA: [
          {
            isRight: true,
            content: "We need to talk about this now.",
            timestamp: new Date('2024-03-10T10:00:00')
          },
          {
            isRight: true,
            content: "I feel like we're not on the same page.",
            timestamp: new Date('2024-03-10T10:05:00')
          }
        ],
        subjectB: [
          {
            isRight: false,
            content: "I understand your concern. Let's discuss this calmly.",
            timestamp: new Date('2024-03-10T10:02:00')
          },
          {
            isRight: false,
            content: "I appreciate you bringing this up. Can you tell me more?",
            timestamp: new Date('2024-03-10T10:07:00')
          }
        ]
      }
    },
    {
      category: "Emotional Expression",
      subjectAScore: 68,
      subjectBScore: 85,
      comparison: `Based on message positioning, ${partnerB} demonstrates higher emotional intelligence through left-aligned responses, while ${partnerA}'s right-aligned messages show strength in practical problem-solving.`,
      individualInsights: {
        subjectA: [
          "Practical approach visible in right-side messages",
          "Reserved emotional expression in responses",
          "Growing emotional awareness in recent exchanges"
        ],
        subjectB: [
          "High emotional intelligence shown in left-side responses",
          "Open about feelings with supportive language",
          "Empathetic responses to partner's messages"
        ]
      },
      messagePatterns: {
        subjectA: [
          {
            isRight: true,
            content: "Let's figure out a solution to this.",
            timestamp: new Date('2024-03-11T14:00:00')
          },
          {
            isRight: true,
            content: "What steps can we take to improve?",
            timestamp: new Date('2024-03-11T14:10:00')
          }
        ],
        subjectB: [
          {
            isRight: false,
            content: "I hear you, and I can sense this is really important to you.",
            timestamp: new Date('2024-03-11T14:05:00')
          },
          {
            isRight: false,
            content: "How are you feeling about all of this?",
            timestamp: new Date('2024-03-11T14:12:00')
          }
        ]
      }
    },
    {
      category: "Conflict Resolution",
      subjectAScore: 80,
      subjectBScore: 73,
      comparison: `${partnerA} excels at finding solutions, while ${partnerB} is skilled at preventing conflicts through early intervention.`,
      individualInsights: {
        subjectA: [
          "Solution-focused approach",
          "Quick to address issues",
          "Sometimes too rushed"
        ],
        subjectB: [
          "Preventive approach",
          "Emotional consideration",
          "Sometimes avoidant"
        ]
      }
    }
  ]);

  const [gottmanAnalysis, setGottmanAnalysis] = useState<GottmanAnalysis[]>([
    {
      horseman: "Criticism",
      icon: AlertTriangle,
      description: "Attacking partner's character rather than specific behavior",
      presence: 'low',
      examples: [
        "Occasional frustration expressed constructively",
        "Focus on specific issues rather than personality"
      ],
      recommendations: [
        "Continue using 'I' statements",
        "Address specific situations instead of making generalizations"
      ]
    },
    {
      horseman: "Defensiveness",
      icon: Shield,
      description: "Self-protection in the form of righteous indignation or innocent victim role",
      presence: 'moderate',
      examples: [
        "Sometimes countering complaints with excuses",
        "Occasional difficulty accepting responsibility"
      ],
      recommendations: [
        "Practice accepting partial responsibility",
        "Listen fully before responding",
        "Focus on understanding partner's perspective"
      ]
    },
    {
      horseman: "Contempt",
      icon: XCircle,
      description: "Attacking sense of self with intention to insult or psychologically abuse",
      presence: 'low',
      examples: [
        "Rare instances of sarcasm",
        "Generally respectful communication"
      ],
      recommendations: [
        "Maintain culture of appreciation",
        "Continue building fondness and admiration"
      ]
    },
    {
      horseman: "Stonewalling",
      icon: CheckCircle,
      description: "Withdrawing from relationship as a way to avoid conflict",
      presence: 'moderate',
      examples: [
        "Occasional need for space during conflicts",
        "Sometimes shutting down during intense discussions"
      ],
      recommendations: [
        "Practice self-soothing techniques",
        "Communicate need for breaks constructively",
        "Set specific time to resume discussions"
      ]
    }
  ]);

  const chartData = results.map(result => ({
    name: result.category,
    [partnerA]: result.subjectAScore,
    [partnerB]: result.subjectBScore
  }));

  const radarData = [
    {
      subject: 'Communication',
      [partnerA]: 75,
      [partnerB]: 82,
      average: 78.5,
      fullMark: 100,
    },
    {
      subject: 'Emotional',
      [partnerA]: 68,
      [partnerB]: 85,
      average: 76.5,
      fullMark: 100,
    },
    {
      subject: 'Conflict',
      [partnerA]: 80,
      [partnerB]: 73,
      average: 76.5,
      fullMark: 100,
    },
    {
      subject: 'Trust',
      [partnerA]: 85,
      [partnerB]: 88,
      average: 86.5,
      fullMark: 100,
    },
    {
      subject: 'Intimacy',
      [partnerA]: 78,
      [partnerB]: 82,
      average: 80,
      fullMark: 100,
    },
    {
      subject: 'Support',
      [partnerA]: 82,
      [partnerB]: 79,
      average: 80.5,
      fullMark: 100,
    },
  ];

  const progressionData = [
    { month: 'Jan', [partnerA]: 65, [partnerB]: 70, average: 67.5 },
    { month: 'Feb', [partnerA]: 68, [partnerB]: 73, average: 70.5 },
    { month: 'Mar', [partnerA]: 72, [partnerB]: 75, average: 73.5 },
    { month: 'Apr', [partnerA]: 75, [partnerB]: 78, average: 76.5 },
    { month: 'May', [partnerA]: 78, [partnerB]: 82, average: 80 },
    { month: 'Jun', [partnerA]: 82, [partnerB]: 85, average: 83.5 },
  ];

  const communicationData = [
    { time: '8 AM', messages: 5, sentiment: 0.8 },
    { time: '10 AM', messages: 8, sentiment: 0.6 },
    { time: '12 PM', messages: 12, sentiment: 0.9 },
    { time: '2 PM', messages: 7, sentiment: 0.7 },
    { time: '4 PM', messages: 10, sentiment: 0.85 },
    { time: '6 PM', messages: 15, sentiment: 0.95 },
    { time: '8 PM', messages: 9, sentiment: 0.75 },
  ];

  const enhancedChartData = [
    {
      category: "Communication",
      [partnerA]: 75,
      [`${partnerA} Trend`]: 78,
      [partnerB]: 82,
      [`${partnerB} Trend`]: 85,
      average: 78.5,
      benchmark: 75
    },
    {
      category: "Emotional Expression",
      [partnerA]: 68,
      [`${partnerA} Trend`]: 72,
      [partnerB]: 85,
      [`${partnerB} Trend`]: 83,
      average: 76.5,
      benchmark: 70
    },
    {
      category: "Conflict Resolution",
      [partnerA]: 80,
      [`${partnerA} Trend`]: 82,
      [partnerB]: 73,
      [`${partnerB} Trend`]: 75,
      average: 76.5,
      benchmark: 72
    },
    {
      category: "Active Listening",
      [partnerA]: 85,
      [`${partnerA} Trend`]: 87,
      [partnerB]: 88,
      [`${partnerB} Trend`]: 90,
      average: 86.5,
      benchmark: 78
    }
  ];

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // Clear all analysis data
      setResults([]);
      setGottmanAnalysis([]);
      
      // Simulate deletion process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate back to home
      navigate('/home');
    } catch (error) {
      console.error('Failed to delete analysis:', error);
      alert('Failed to delete the analysis. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const generateReport = () => {
    const report = `
# Relationship Analysis Report
Generated on ${new Date().toLocaleDateString()}

## Overview
Analysis of relationship dynamics between ${partnerA} and ${partnerB}

## Gottman's Four Horsemen Analysis
${gottmanAnalysis.map(analysis => `
### ${analysis.horseman}
- Presence Level: ${analysis.presence}
- Key Observations: ${analysis.examples.join(', ')}
- Recommendations: ${analysis.recommendations.join(', ')}
`).join('\n')}

## Communication Analysis
${results.map(result => `
### ${result.category}
- ${partnerA}'s Score: ${result.subjectAScore}%
- ${partnerB}'s Score: ${result.subjectBScore}%
- Comparison: ${result.comparison}

Individual Insights:
${partnerA}:
${result.individualInsights.subjectA.map(insight => `- ${insight}`).join('\n')}

${partnerB}:
${result.individualInsights.subjectB.map(insight => `- ${insight}`).join('\n')}
`).join('\n')}

## Recommendations
1. Continue building on identified strengths
2. Address areas of growth through open communication
3. Maintain awareness of interaction patterns
4. Practice active listening and emotional expression
5. Schedule regular check-ins to track progress
`;

    return report;
  };

  const saveReport = async () => {
    setIsSaving(true);
    try {
      const report = generateReport();
      const blob = new Blob([report], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relationship-analysis-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to save report:', error);
      alert('Failed to save the report. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const getPresenceColor = (presence: string) => {
    switch (presence) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (results.length === 0) {
    return (
      <div className="min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center p-6">
        <div className="text-center max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8">
          <Upload className="w-16 h-16 text-pink-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-3">No Analysis Yet</h2>
          <p className="text-gray-600 mb-6">
            Upload conversation screenshots to gain valuable insights into your communication patterns and emotional dynamics.
          </p>
          <button
            onClick={() => navigate('/home')}
            className="bg-pink-500 text-white px-6 py-3 rounded-xl hover:bg-pink-600 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
          >
            <Upload className="w-5 h-5" />
            <span>Upload Screenshots</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-block p-3 rounded-full bg-gradient-to-r from-pink-100 to-purple-100 mb-4">
            <Heart className="w-8 h-8 text-pink-500" />
          </div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            Relationship Analysis
          </h1>
          <p className="text-gray-600 text-lg">
            Comprehensive analysis of communication patterns and relationship dynamics
          </p>
        </div>

        {/* Overview Card with Enhanced Radar Chart */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-8">
          <div className="flex items-center mb-6">
            <Users className="w-7 h-7 text-primary-500 mr-3" />
            <h2 className="text-2xl font-semibold">Relationship Overview</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-4 rounded-xl">
              <div className="flex items-center mb-2">
                <Heart className="w-5 h-5 text-pink-500 mr-2" />
                <h3 className="font-medium">Overall Health</h3>
              </div>
              <p className="text-2xl font-bold text-pink-500">85%</p>
              <p className="text-sm text-gray-600">Strong foundation</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl">
              <div className="flex items-center mb-2">
                <Sparkles className="w-5 h-5 text-purple-500 mr-2" />
                <h3 className="font-medium">Growth Trend</h3>
              </div>
              <p className="text-2xl font-bold text-purple-500">+12%</p>
              <p className="text-sm text-gray-600">Last 3 months</p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
              <div className="flex items-center mb-2">
                <MessageSquare className="w-5 h-5 text-blue-500 mr-2" />
                <h3 className="font-medium">Communication</h3>
              </div>
              <p className="text-2xl font-bold text-blue-500">92%</p>
              <p className="text-sm text-gray-600">Excellent engagement</p>
            </div>
          </div>

          <div className="h-96 w-full mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid strokeDasharray="3 3" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#4B5563', fontSize: 14 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar
                  name={partnerA}
                  dataKey={partnerA}
                  stroke="#f43f5e"
                  fill="#f43f5e"
                  fillOpacity={0.3}
                />
                <Radar
                  name={partnerB}
                  dataKey={partnerB}
                  stroke="#a855f7"
                  fill="#a855f7"
                  fillOpacity={0.3}
                />
                <Radar
                  name="Average"
                  dataKey="average"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.2}
                />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Enhanced Comparison Chart */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <LucideBarChart className="w-7 h-7 text-primary-500 mr-3" />
              <h2 className="text-2xl font-semibold">Relationship Dynamics</h2>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <span className="flex items-center">
                <span className="w-3 h-3 bg-primary-500 rounded-full mr-1"></span>
                {partnerA}
              </span>
              <span className="flex items-center">
                <span className="w-3 h-3 bg-secondary-500 rounded-full mr-1"></span>
                {partnerB}
              </span>
              <span className="flex items-center">
                <span className="w-3 h-3 bg-gray-300 rounded-full mr-1"></span>
                Benchmark
              </span>
            </div>
          </div>

          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={enhancedChartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="category"
                  tick={{ fill: '#4B5563', fontSize: 12 }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  domain={[0, 100]}
                  tick={{ fill: '#4B5563' }}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value) => [`${value}%`]}
                />
                <Legend 
                  verticalAlign="top"
                  height={36}
                  formatter={(value) => {
                    if (value.includes('Trend')) return null;
                    return value;
                  }}
                />
                <Bar 
                  dataKey={partnerA} 
                  fill="#f43f5e"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
                <Bar 
                  dataKey={partnerB} 
                  fill="#a855f7"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
                <Line
                  type="monotone"
                  dataKey="benchmark"
                  stroke="#9CA3AF"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey={`${partnerA} Trend`}
                  stroke="#f43f5e"
                  strokeDasharray="3 3"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey={`${partnerB} Trend`}
                  stroke="#a855f7"
                  strokeDasharray="3 3"
                  strokeWidth={2}
                  dot={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {enhancedChartData.map((item) => (
              <div key={item.category} className="bg-gray-50 p-4 rounded-xl">
                <h3 className="text-sm font-medium text-gray-600 mb-2">{item.category}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">{partnerA}</span>
                    <span className="text-sm font-medium text-primary-500">{item[partnerA]}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">{partnerB}</span>
                    <span className="text-sm font-medium text-secondary-500">{item[partnerB]}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Average</span>
                    <span className="text-sm font-medium text-gray-600">{item.average}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Progression Over Time */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-8">
          <div className="flex items-center mb-6">
            <LucideLineChart className="w-7 h-7 text-primary-500 mr-3" />
            <h2 className="text-2xl font-semibold">Growth Progression</h2>
          </div>
          
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={progressionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" tick={{ fill: '#4B5563' }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#4B5563' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey={partnerA}
                  stroke="#f43f5e"
                  fill="#fecdd3"
                  stackId="1"
                />
                <Area
                  type="monotone"
                  dataKey={partnerB}
                  stroke="#a855f7"
                  fill="#e9d5ff"
                  stackId="1"
                />
                <Area
                  type="monotone"
                  dataKey="average"
                  stroke="#3b82f6"
                  fill="#bfdbfe"
                  strokeDasharray="3 3"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Communication Patterns */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-8">
          <div className="flex items-center mb-6">
            <MessageSquare className="w-7 h-7 text-primary-500 mr-3" />
            <h2 className="text-2xl font-semibold">Communication Patterns</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 p-4 rounded-xl">
              <h3 className="font-medium text-gray-700 mb-3">Message Frequency</h3>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={communicationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="messages"
                      stroke="#f43f5e"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-xl">
              <h3 className="font-medium text-gray-700 mb-3">Sentiment Analysis</h3>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={communicationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis domain={[0, 1]} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="sentiment"
                      stroke="#a855f7"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Gottman's Four Horsemen Analysis */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-8">
          <div className="flex items-center mb-6">
            <Brain className="w-7 h-7 text-primary-500 mr-3" />
            <h2 className="text-2xl font-semibold">Gottman's Four Horsemen Analysis</h2>
          </div>
          <p className="text-gray-600 mb-8 text-lg">
            Based on Dr. John Gottman's research on relationship patterns that predict the end of a relationship. Lower presence of these patterns indicates a healthier relationship.
          </p>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {gottmanAnalysis.map((analysis, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <analysis.icon className="w-6 h-6 text-primary-500 mr-3" />
                    <h3 className="text-xl font-semibold text-gray-800">{analysis.horseman}</h3>
                  </div>
                  <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${getPresenceColor(analysis.presence)}`}>
                    {analysis.presence.charAt(0).toUpperCase() + analysis.presence.slice(1)} Presence
                  </span>
                </div>
                
                <p className="text-gray-600 mb-6 text-lg">{analysis.description}</p>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-3 text-lg">Current Patterns</h4>
                    <ul className="space-y-3">
                      {analysis.examples.map((example, i) => (
                        <li key={i} className="flex items-start text-gray-600">
                          <span className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span className="text-lg">{example}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-700 mb-3 text-lg">Recommendations</h4>
                    <ul className="space-y-3">
                      {analysis.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start text-gray-600">
                          <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-1" />
                          <span className="text-lg">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Analysis Results */}
        {results.map((result, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <Heart className="w-7 h-7 text-primary-500 mr-3" />
                <h2 className="text-2xl font-semibold">{result.category}</h2>
              </div>
            </div>

            {/* Comparison Bar */}
            <div className="mb-10">
              <div className="flex justify-between mb-3">
                <span className="text-lg font-medium text-gray-600">{partnerA}</span>
                <span className="text-lg font-medium text-gray-600">{partnerB}</span>
              </div>
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-full h-6 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary-500 rounded-full transition-all duration-500"
                    style={{ width: `${result.subjectAScore}%` }}
                  ></div>
                </div>
                <span className="text-2xl font-bold text-primary-500 min-w-[4rem] text-right">
                  {result.subjectAScore}%
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-full h-6 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-secondary-500 rounded-full transition-all duration-500"
                    style={{ width: `${result.subjectBScore}%` }}
                  ></div>
                </div>
                <span className="text-2xl font-bold text-secondary-500 min-w-[4rem] text-right">
                  {result.subjectBScore}%
                </span>
              </div>
            </div>

            {/* Comparison Text */}
            <div className="bg-gray-50 p-6 rounded-xl mb-8">
              <p className="text-gray-700 text-lg leading-relaxed">{result.comparison}</p>
            </div>

            {/* Individual Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-primary-50 p-6 rounded-xl">
                <h3 className="font-semibold text-primary-700 mb-4 text-lg flex items-center">
                  <ArrowRight className="w-5 h-5 mr-2" />
                  {partnerA}'s Patterns
                </h3>
                <ul className="space-y-3">
                  {result.individualInsights.subjectA.map((insight, i) => (
                    <li key={i} className="flex items-start text-gray-700">
                      <span className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span className="text-lg">{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-secondary-50 p-6 rounded-xl">
                <h3 className="font-semibold text-secondary-700 mb-4 text-lg flex items-center">
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  {partnerB}'s Patterns
                </h3>
                <ul className="space-y-3">
                  {result.individualInsights.subjectB.map((insight, i) => (
                    <li key={i} className="flex items-start text-gray-700">
                      <span className="w-2 h-2 bg-secondary-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span className="text-lg">{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Message Pattern Analysis */}
            {result.messagePatterns && (
              <div className="mt-8">
                <h3 className="font-semibold text-gray-800 mb-6 text-xl">Message Pattern Analysis</h3>
                <div className="space-y-6">
                  {result.messagePatterns.subjectA.map((msg, i) => (
                    <div key={i} className="flex justify-end">
                      <div className="max-w-[80%] bg-primary-50 rounded-xl p-4">
                        <p className="text-gray-800 text-lg">{msg.content}</p>
                        <p className="text-sm text-gray-500 mt-2">
                          {msg.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {result.messagePatterns.subjectB.map((msg, i) => (
                    <div key={i} className="flex justify-start">
                      <div className="max-w-[80%] bg-secondary-50 rounded-xl p-4">
                        <p className="text-gray-800 text-lg">{msg.content}</p>
                        <p className="text-sm text-gray-500 mt-2">
                          {msg.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Fixed bottom buttons */}
        <div className="fixed bottom-20 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-100 p-4 shadow-lg z-50">
          <div className="max-w-3xl mx-auto flex items-center gap-4">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex-1 flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-all duration-300 transform hover:scale-105"
            >
              <Trash2 className="w-5 h-5" />
              <span className="font-medium">Delete Analysis</span>
            </button>
            <button
              onClick={saveReport}
              disabled={isSaving}
              className={`flex-1 flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-all duration-300 transform hover:scale-105 ${
                isSaving ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {isSaving ? (
                <>
                  <Save className="w-5 h-5 animate-spin" />
                  <span className="font-medium">Saving...</span>
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  <span className="font-medium">Save Report</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-auto">
              <div className="flex items-center mb-6">
                <AlertCircle className="w-8 h-8 text-red-500 mr-3" />
                <h2 className="text-2xl font-semibold">Delete Analysis</h2>
              </div>
              <p className="text-gray-600 text-lg mb-8">
                Are you sure you want to delete this analysis? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-6 py-3 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all duration-300 font-medium"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-all duration-300 font-medium"
                >
                  {isDeleting ? (
                    <>
                      <Save className="w-5 h-5 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-5 h-5" />
                      <span>Delete</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}