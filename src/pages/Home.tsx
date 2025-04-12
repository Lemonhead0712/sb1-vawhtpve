import React, { useState } from 'react';
import {
  Upload, MessageCircle, LineChart, Brain, Target, Heart, Bot, Users, Loader
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useSubjects } from '../context/SubjectsContext';
import { getUser, supabase } from '../lib/supabase';

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any[]>([]);
  const { subjectA, subjectB } = useSubjects();
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleAnalyze = async () => {
    if (files.length === 0) {
      alert('Please select at least one file to analyze.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResults([]);

    try {
      const user = await getUser();
      if (!user) {
        alert('You must be logged in to run analysis.');
        setIsAnalyzing(false);
        return;
      }

      const analyses = await Promise.all(
        files.map(async (file) => {
          const formData = new FormData();
          formData.append('image', file);
          formData.append('userId', user.id);

          const response = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-chat`,
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
              },
              body: formData,
            }
          );

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to analyze image: ${errorText}`);
          }

          return await response.json();
        })
      );

      setAnalysisResults(analyses);
      setFiles([]);

      await supabase.from('analysis_results').delete().eq('user_id', user.id);

      const { error: storeError } = await supabase
        .from('analysis_results')
        .insert(
          analyses.map((analysis) => ({
            user_id: user.id,
            category: 'Communication Style',
            subject_a_score: calculateScore(analysis.patterns),
            subject_b_score: calculateScore(analysis.patterns),
            comparison: generateComparison(analysis),
            subject_a_insights: generateInsights(analysis, 'A'),
            subject_b_insights: generateInsights(analysis, 'B'),
            message_patterns: analysis.patterns,
          }))
        );

      if (storeError) throw storeError;

      navigate('/analysis');
    } catch (error: any) {
      console.error('Analysis failed:', error);
      alert(error.message || 'An error occurred during analysis. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const calculateScore = (patterns: any) => {
    const baseScore = 70;
    let adjustments = 0;
    adjustments += Math.min(patterns.questionFrequency * 2, 10);
    adjustments += Math.min(patterns.emotionalExpressions * 2, 10);
    adjustments += Math.min(patterns.averageMessageLength, 10);
    return Math.min(Math.max(baseScore + adjustments, 0), 100);
  };

  const generateComparison = (analysis: any) => {
    const sentiment = analysis.sentiment.label;
    const patterns = analysis.patterns;

    let comparison = `The conversation shows a ${sentiment} overall tone. `;
    if (patterns.questionFrequency > 5) {
      comparison += "There's a high level of engagement through questions. ";
    }
    if (patterns.emotionalExpressions > 3) {
      comparison += "Emotional expression is frequent and varied. ";
    }
    if (patterns.averageMessageLength > 20) {
      comparison += "Messages tend to be detailed and thorough. ";
    }

    return comparison;
  };

  const generateInsights = (analysis: any, subject: 'A' | 'B') => {
    const insights = [];
    const patterns = analysis.patterns;

    if (patterns.questionFrequency > 5) {
      insights.push('Shows active engagement through questions');
    }
    if (patterns.emotionalExpressions > 3) {
      insights.push('Expresses emotions openly');
    }
    if (patterns.averageMessageLength > 20) {
      insights.push('Communicates thoroughly and in detail');
    }

    return insights;
  };

  return (
    <div className="p-6">
      <div className="text-center mb-8">
        <div className="inline-block p-3 rounded-full bg-pink-100 mb-4">
          <Heart className="w-8 h-8 text-pink-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">LoveLens</h1>
        <p className="text-gray-600 mb-4">
          Your AI-powered relationship insight companion. Upload chat screenshots to gain valuable insights into your communication patterns and emotional dynamics.
        </p>
      </div>

      {(subjectA || subjectB) && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Users className="w-6 h-6 text-pink-500 mr-2" />
              <h2 className="text-lg font-semibold">Analyzing Relationship</h2>
            </div>
            <Link to="/setup" className="text-sm text-pink-500 hover:text-pink-600 transition-colors">
              Edit Names
            </Link>
          </div>
          <div className="flex items-center justify-center space-x-4">
            <span className="text-gray-700">{subjectA || 'Partner A'}</span>
            <Heart className="w-4 h-4 text-pink-500" />
            <span className="text-gray-700">{subjectB || 'Partner B'}</span>
          </div>
        </div>
      )}

      {!subjectA && !subjectB && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="text-center">
            <Users className="w-8 h-8 text-pink-500 mx-auto mb-3" />
            <h2 className="text-lg font-semibold mb-2">Personalize Your Analysis</h2>
            <p className="text-gray-600 mb-4">Add names to get personalized insights</p>
            <Link to="/setup" className="inline-block bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition-colors">
              Add Names
            </Link>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="text-center">
          <div className="mb-4">
            <Upload className="w-12 h-12 text-pink-500 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Upload Screenshots</h2>
          <p className="text-gray-600 mb-4">
            Upload conversation screenshots for detailed analysis of communication patterns and emotional tones
          </p>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="inline-block bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition-colors cursor-pointer"
          >
            Choose Files
          </label>
        </div>

        {files.length > 0 && (
          <div className="mt-6">
            <h3 className="font-medium mb-2">Selected Files:</h3>
            <ul className="space-y-2">
              {files.map((file, index) => (
                <li key={index} className="flex items-center text-sm text-gray-600">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  {file.name}
                </li>
              ))}
            </ul>
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className={`w-full mt-4 bg-pink-500 text-white py-3 rounded-lg hover:bg-pink-600 transition-colors flex items-center justify-center ${isAnalyzing ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {isAnalyzing ? (
                <>
                  <Loader className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing Conversations...
                </>
              ) : (
                'Analyze Conversations'
              )}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Link to="/analysis" className="block">
          <div className="bg-white rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow">
            <div className="flex flex-col items-center">
              <LineChart className="w-8 h-8 text-pink-500 mb-2" />
              <h3 className="text-sm font-semibold text-center">Analysis</h3>
              <p className="text-xs text-gray-500 text-center mt-1">View insights</p>
            </div>
          </div>
        </Link>

        <Link to="/growth" className="block">
          <div className="bg-white rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow">
            <div className="flex flex-col items-center">
              <Brain className="w-8 h-8 text-pink-500 mb-2" />
              <h3 className="text-sm font-semibold text-center">Growth</h3>
              <p className="text-xs text-gray-500 text-center mt-1">Track progress</p>
            </div>
          </div>
        </Link>

        <Link to="/analysis" className="block">
          <div className="bg-white rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow">
            <div className="flex flex-col items-center">
              <Target className="w-8 h-8 text-pink-500 mb-2" />
              <h3 className="text-sm font-semibold text-center">Goals</h3>
              <p className="text-xs text-gray-500 text-center mt-1">Set targets</p>
            </div>
          </div>
        </Link>

        <Link to="/assistant" className="block">
          <div className="bg-white rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow">
            <div className="flex flex-col items-center">
              <Bot className="w-8 h-8 text-pink-500 mb-2" />
              <h3 className="text-sm font-semibold text-center">AI Assistant</h3>
              <p className="text-xs text-gray-500 text-center mt-1">Get help</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
