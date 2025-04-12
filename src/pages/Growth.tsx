import React from 'react';
import { Brain, Target, Heart, Sparkles, ArrowUp, Users, TrendingUp, MessageSquare } from 'lucide-react';
import { useSubjects } from '../context/SubjectsContext';

export default function Growth() {
  const { subjectA, subjectB } = useSubjects();

  const growthAreas = [
    {
      title: "Communication Dynamics",
      description: `Enhance the way ${subjectA} and ${subjectB} express thoughts and feelings`,
      tasks: [
        {
          forSubject: subjectA,
          task: "Practice active listening without interrupting"
        },
        {
          forSubject: subjectB,
          task: "Share feelings using 'I' statements more frequently"
        },
        {
          forBoth: true,
          task: "Schedule weekly check-in conversations"
        }
      ]
    },
    {
      title: "Emotional Connection",
      description: "Strengthen emotional bonds and deepen understanding",
      tasks: [
        {
          forSubject: subjectA,
          task: "Express appreciation for specific actions"
        },
        {
          forSubject: subjectB,
          task: "Share vulnerable thoughts more openly"
        },
        {
          forBoth: true,
          task: "Create meaningful shared experiences weekly"
        }
      ]
    },
    {
      title: "Conflict Resolution",
      description: "Transform disagreements into opportunities for growth",
      tasks: [
        {
          forSubject: subjectA,
          task: "Practice taking timeouts when emotions run high"
        },
        {
          forSubject: subjectB,
          task: "Focus on understanding before problem-solving"
        },
        {
          forBoth: true,
          task: "Develop shared conflict resolution strategies"
        }
      ]
    }
  ];

  const insights = [
    {
      title: "Communication Patterns",
      insights: [
        `${subjectA} tends to be more direct in communication`,
        `${subjectB} shows strength in emotional expression`,
        "Both partners demonstrate willingness to improve"
      ]
    },
    {
      title: "Emotional Intelligence",
      insights: [
        `${subjectA} exhibits strong empathy in discussions`,
        `${subjectB} shows good self-awareness`,
        "Mutual respect is evident in interactions"
      ]
    }
  ];

  return (
    <div className="p-6">
      <div className="text-center mb-8">
        <div className="inline-block p-3 rounded-full bg-pink-100 mb-4">
          <TrendingUp className="w-8 h-8 text-pink-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Growth Journey</h1>
        <p className="text-gray-600">
          Personalized development path for {subjectA} and {subjectB}
        </p>
      </div>
      
      <div className="space-y-6">
        {/* Overview Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center mb-4">
            <Users className="w-6 h-6 text-pink-500 mr-2" />
            <h2 className="text-xl font-semibold">Relationship Growth Plan</h2>
          </div>
          <p className="text-gray-600">
            Based on your relationship analysis, we've identified key areas where both {subjectA} and {subjectB} can grow together and individually.
          </p>
        </div>

        {/* Growth Areas */}
        {growthAreas.map((area, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <Heart className="w-6 h-6 text-pink-500 mr-2" />
              <h2 className="text-xl font-semibold">{area.title}</h2>
            </div>
            <p className="text-gray-600 mb-6">{area.description}</p>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700 flex items-center">
                <Target className="w-5 h-5 text-pink-500 mr-2" />
                Action Steps
              </h3>
              <div className="space-y-3">
                {area.tasks.map((task, i) => (
                  <div key={i} className="flex items-center bg-gray-50 p-4 rounded-xl">
                    <ArrowUp className="w-4 h-4 text-pink-500 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-gray-700">{task.task}</p>
                      {!task.forBoth && (
                        <span className="text-sm text-pink-500 font-medium">
                          For: {task.forSubject}
                        </span>
                      )}
                      {task.forBoth && (
                        <span className="text-sm text-purple-500 font-medium">
                          For both partners
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        {/* Insights & Recommendations */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center mb-6">
            <Sparkles className="w-6 h-6 text-pink-500 mr-2" />
            <h2 className="text-xl font-semibold">Personalized Insights</h2>
          </div>
          
          <div className="space-y-6">
            {insights.map((section, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-xl">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <MessageSquare className="w-4 h-4 text-pink-500 mr-2" />
                  {section.title}
                </h3>
                <ul className="space-y-2">
                  {section.insights.map((insight, i) => (
                    <li key={i} className="flex items-start text-gray-700">
                      <span className="w-2 h-2 bg-pink-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-6 rounded-xl">
              <h3 className="font-semibold text-gray-800 mb-3">Long-term Goals</h3>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <Target className="w-4 h-4 text-pink-500 mr-2" />
                  <span className="text-gray-700">Build stronger emotional connection through daily check-ins</span>
                </li>
                <li className="flex items-center">
                  <Target className="w-4 h-4 text-pink-500 mr-2" />
                  <span className="text-gray-700">Develop more effective communication patterns</span>
                </li>
                <li className="flex items-center">
                  <Target className="w-4 h-4 text-pink-500 mr-2" />
                  <span className="text-gray-700">Create lasting trust through consistent actions</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}