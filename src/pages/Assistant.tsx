import React, { useState, useRef, useEffect } from 'react';
import { MessageSquareMore, Send, Bot, Mic, Clock, Loader, Sparkles, Heart } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useSubjects } from '../context/SubjectsContext';

interface Message {
  type: 'assistant' | 'user';
  content: string;
  timestamp: Date;
  status?: 'typing' | 'complete';
  context?: {
    emotion?: string;
    intent?: string;
    topics?: string[];
  };
}

interface ConversationContext {
  currentTopic?: string;
  emotionalState?: string;
  previousTopics: string[];
  relationshipDynamics: {
    communicationStyle?: string;
    challengeAreas?: string[];
    strengths?: string[];
  };
}

const emotionalResponses = {
  positive: [
    "That's great to hear. What do you think helped?",
    "Sounds like things are moving in a good direction.",
    "It's nice to hear some growth. What would you like to focus on next?"
  ],
  negative: [
    "That sounds tough. Want to unpack it together?",
    "I hear you. What part of this feels the hardest right now?",
    "Let’s try to figure out what’s underneath that feeling."
  ],
  neutral: [
    "How are you processing this?",
    "What else is coming up for you right now?",
    "Want to explore this a bit deeper together?"
  ]
};

const topicalResponses = {
  communication: [
    "What’s been the biggest challenge in communicating lately?",
    "Is there something you wish your partner understood better?",
    "How do you feel when your conversations don’t go as planned?"
  ],
  trust: [
    "What has helped or hurt your trust in this relationship?",
    "Let’s think about how you define trust. Has that been honored?",
    "Is trust something you feel solid in—or still unsure about?"
  ],
  growth: [
    "How have you grown together—or apart—lately?",
    "What kind of relationship are you both trying to build?",
    "Do you feel like you're on the same page when it comes to growth?"
  ]
};

export default function Assistant() {
  const { subjectA, subjectB } = useSubjects();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([{
    type: 'assistant',
    content: `Hey! 👋 I'm your relationship AI companion. ${
      subjectA && subjectB 
        ? `Let’s explore how ${subjectA} and ${subjectB} connect and grow together.`
        : "I'm here to talk through anything on your mind."
    }`,
    timestamp: new Date(),
    status: 'complete'
  }]);

  const [isThinking, setIsThinking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showTypingIndicator, setShowTypingIndicator] = useState(false);
  const [conversationContext, setConversationContext] = useState<ConversationContext>({
    previousTopics: [],
    relationshipDynamics: {}
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const analyzeMessage = (content: string) => {
    const lower = content.toLowerCase();
    const emotionalKeywords = {
      positive: ['happy', 'love', 'better', 'good'],
      negative: ['sad', 'angry', 'hurt', 'worried'],
      neutral: ['think', 'feel', 'curious']
    };

    let emotion: keyof typeof emotionalResponses = 'neutral';
    for (const key in emotionalKeywords) {
      if (emotionalKeywords[key as keyof typeof emotionalResponses].some(k => lower.includes(k))) {
        emotion = key as keyof typeof emotionalResponses;
        break;
      }
    }

    const topicKeywords = {
      communication: ['talk', 'say', 'listen'],
      trust: ['trust', 'honest', 'believe'],
      growth: ['change', 'grow', 'improve']
    };

    let topic = '';
    for (const key in topicKeywords) {
      if (topicKeywords[key as keyof typeof topicalResponses].some(k => lower.includes(k))) {
        topic = key;
        break;
      }
    }

    return { emotion, topic };
  };

  const generateResponse = (userInput: string) => {
    const { emotion, topic } = analyzeMessage(userInput);
    setConversationContext(prev => ({
      ...prev,
      currentTopic: topic || prev.currentTopic,
      emotionalState: emotion,
      previousTopics: [...prev.previousTopics, topic].filter(Boolean).slice(-3)
    }));

    let responsePool = emotionalResponses[emotion];
    if (topic && Math.random() > 0.4) {
      responsePool = topicalResponses[topic as keyof typeof topicalResponses];
    }

    const base = responsePool[Math.floor(Math.random() * responsePool.length)];
    if (subjectB && Math.random() > 0.7) {
      const tag = [
        `How do you think ${subjectB} would react to this?`,
        `What do you wish ${subjectB} could understand here?`
      ];
      return `${base} ${tag[Math.floor(Math.random() * tag.length)]}`;
    }
    return base;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    const input = message;
    setMessage('');

    setMessages(prev => [...prev, {
      type: 'user',
      content: input,
      timestamp: new Date()
    }]);

    setIsThinking(true);
    await new Promise(res => setTimeout(res, 900));
    setIsThinking(false);

    const reply = generateResponse(input);
    setShowTypingIndicator(true);
    await simulateResponse(reply);
  };

  const simulateResponse = async (reply: string) => {
    const parts = reply.split('. ');
    let partial = '';
    for (let p of parts) {
      partial += p + '. ';
      setMessages(prev => [
        ...prev.slice(0, -1),
        { type: 'assistant', content: partial.trim(), timestamp: new Date(), status: 'typing' }
      ]);
      await new Promise(r => setTimeout(r, 400));
    }
    setMessages(prev => [
      ...prev.slice(0, -1),
      { type: 'assistant', content: reply, timestamp: new Date(), status: 'complete' }
    ]);
    setShowTypingIndicator(false);
  };

  const formatTime = (date: Date) => date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  return (
    <div className="flex h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <div className="flex-1 flex flex-col">
        <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white p-4">
          <div className="max-w-3xl mx-auto flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-medium">AI Relationship Assistant</h2>
              <p className="text-sm text-white/80">Let’s explore your relationship journey together</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} items-end space-x-2`}>
                {msg.type === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}
                <div className={`max-w-[80%] ${msg.type === 'user' ? 'order-first' : ''}`}>
                  <div className={`rounded-2xl px-4 py-2 ${msg.type === 'user' ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white ml-auto' : 'bg-white shadow-sm border border-gray-100'}`}>
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                    {msg.status === 'typing' && (
                      <div className="mt-2 flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300"></div>
                      </div>
                    )}
                  </div>
                  <div className="mt-1 text-xs text-gray-500 flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatTime(msg.timestamp)}
                  </div>
                </div>
              </div>
            ))}
            {isThinking && (
              <div className="flex items-end space-x-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-white shadow-sm border border-gray-100 rounded-2xl px-4 py-2 text-gray-500 flex items-center">
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="border-t bg-white/80 backdrop-blur-sm p-4">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Type your thoughts here..."
                  className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white/50 backdrop-blur-sm"
                  disabled={isThinking || showTypingIndicator || isRecording}
                />
                <button type="button" onClick={() => setIsRecording(!isRecording)} className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'text-gray-400 hover:text-pink-500'}`}>
                  <Mic className="w-5 h-5" />
                </button>
              </div>
              <button
                type="submit"
                disabled={isThinking || showTypingIndicator || !message.trim() || isRecording}
                className="bg-gradient-to-r from-pink-500 to-purple-500 text-white p-3 rounded-full ${isThinking ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg hover:scale-105'}"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
