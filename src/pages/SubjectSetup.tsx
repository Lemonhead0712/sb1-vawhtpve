import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubjects } from '../context/SubjectsContext';
import { Heart, Users, ArrowRight } from 'lucide-react';

export default function SubjectSetup() {
  const navigate = useNavigate();
  const { setSubjects } = useSubjects();
  const [subjectA, setSubjectA] = useState('');
  const [subjectB, setSubjectB] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubjects(subjectA, subjectB);
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 p-6">
      <div className="max-w-md mx-auto pt-12">
        <div className="text-center mb-8">
          <div className="inline-block p-4 rounded-full bg-pink-100 mb-4">
            <Users className="w-10 h-10 text-pink-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Who would you like to analyze?
          </h1>
          <p className="text-gray-600">
            Enter the names of both people in the relationship to begin the analysis
          </p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Your Name
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all bg-gray-50"
                value={subjectA}
                onChange={(e) => setSubjectA(e.target.value)}
                placeholder="Enter your name"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Partner's Name
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all bg-gray-50"
                value={subjectB}
                onChange={(e) => setSubjectB(e.target.value)}
                placeholder="Enter your partner's name"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-xl hover:from-pink-600 hover:to-purple-600 transition-all transform hover:scale-[1.02] flex items-center justify-center space-x-2 font-medium text-lg"
            >
              <span>Begin Analysis</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}