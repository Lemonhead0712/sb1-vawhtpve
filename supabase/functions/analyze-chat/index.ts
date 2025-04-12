import { createClient } from 'npm:@supabase/supabase-js@2.39.7';
import { createWorker } from 'npm:tesseract.js@5.0.5';
import { RateLimiterMemory } from 'npm:rate-limiter-flexible@5.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Rate limiter configuration
const rateLimiter = new RateLimiterMemory({
  points: 20, // 20 requests
  duration: 60 * 60, // per hour
  blockDuration: 60 * 60, // Block for 1 hour if exceeded
});

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get user IP or ID for rate limiting
    const clientId = req.headers.get('x-forwarded-for') || 'anonymous';
    
    // Check rate limit
    try {
      await rateLimiter.consume(clientId);
    } catch (error) {
      if (error.msBeforeNext) {
        return new Response(
          JSON.stringify({
            error: 'Rate limit exceeded',
            retryAfter: Math.ceil(error.msBeforeNext / 1000)
          }),
          { 
            status: 429,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
              'Retry-After': Math.ceil(error.msBeforeNext / 1000).toString()
            }
          }
        );
      }
      throw error;
    }

    const formData = await req.formData();
    const imageFile = formData.get('image') as File;
    const userId = formData.get('userId') as string;

    if (!imageFile || !userId) {
      throw new Error('Image and userId are required');
    }

    // Initialize Tesseract.js worker with improved configuration
    const worker = await createWorker();
    await worker.loadLanguage('eng');
    await worker.initialize('eng', {
      tessedit_char_whitelist: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,!?\'"-:;()[]{}',
      tessedit_pageseg_mode: '6', // Assume uniform text block
      tessedit_ocr_engine_mode: '2' // Use neural nets mode for better accuracy
    });

    // Convert File to ArrayBuffer and then to Uint8Array for Tesseract
    const arrayBuffer = await imageFile.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Extract text from image with confidence score
    const { data: { text, confidence } } = await worker.recognize(uint8Array);
    await worker.terminate();

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Perform comprehensive analysis
    const analysis = {
      text,
      confidence,
      sentiment: await analyzeSentiment(text),
      patterns: await analyzePatterns(text),
      topics: await identifyTopics(text),
      messageStructure: analyzeMessageStructure(text),
      relationshipIndicators: analyzeRelationshipIndicators(text)
    };

    // Store analysis results
    const { error: storeError } = await supabase
      .from('analysis_results')
      .insert({
        user_id: userId,
        raw_text: text,
        ocr_confidence: confidence,
        analysis_results: analysis,
        created_at: new Date().toISOString()
      });

    if (storeError) throw storeError;

    return new Response(
      JSON.stringify(analysis),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function analyzeSentiment(text: string) {
  // Enhanced sentiment analysis with emotional context
  const emotions = {
    joy: ['happy', 'love', 'great', 'wonderful', 'excited', 'delighted'],
    sadness: ['sad', 'upset', 'hurt', 'disappointed', 'sorry', 'miss'],
    anger: ['angry', 'mad', 'frustrated', 'annoyed', 'hate', 'furious'],
    fear: ['afraid', 'worried', 'scared', 'anxious', 'nervous', 'concerned'],
    trust: ['trust', 'believe', 'sure', 'confident', 'faith', 'rely'],
    surprise: ['wow', 'omg', 'unexpected', 'surprised', 'shocked', 'amazed']
  };

  const words = text.toLowerCase().split(/\W+/);
  const emotionalProfile = {};
  let dominantEmotion = null;
  let maxScore = 0;

  // Calculate emotional scores
  for (const [emotion, keywords] of Object.entries(emotions)) {
    const score = words.filter(word => keywords.includes(word)).length;
    emotionalProfile[emotion] = score;
    if (score > maxScore) {
      maxScore = score;
      dominantEmotion = emotion;
    }
  }

  return {
    emotionalProfile,
    dominantEmotion,
    intensity: maxScore > 0 ? maxScore / words.length : 0
  };
}

async function analyzePatterns(text: string) {
  // Enhanced pattern analysis
  const messages = text.split(/\n+/);
  
  return {
    messageCount: messages.length,
    averageLength: messages.reduce((acc, msg) => acc + msg.length, 0) / messages.length,
    questionFrequency: (text.match(/\?/g) || []).length,
    exclamationFrequency: (text.match(/!/g) || []).length,
    emoticons: (text.match(/[:;]-?[\)(\[\]\\\/PpD]/g) || []).length,
    urls: (text.match(/https?:\/\/[^\s]+/g) || []).length,
    timestamps: (text.match(/\d{1,2}:\d{2}/g) || []).length,
    capitalizedWords: (text.match(/\b[A-Z]{2,}\b/g) || []).length,
    responseTime: analyzeResponseTimes(text)
  };
}

function analyzeResponseTimes(text: string) {
  const timestamps = text.match(/\d{1,2}:\d{2}/g) || [];
  if (timestamps.length < 2) return null;

  const times = timestamps.map(t => {
    const [hours, minutes] = t.split(':').map(Number);
    return hours * 60 + minutes;
  });

  const differences = [];
  for (let i = 1; i < times.length; i++) {
    differences.push(times[i] - times[i - 1]);
  }

  return {
    average: differences.reduce((a, b) => a + b, 0) / differences.length,
    min: Math.min(...differences),
    max: Math.max(...differences)
  };
}

async function identifyTopics(text: string) {
  // Enhanced topic identification
  const topics = {
    communication: ['talk', 'say', 'tell', 'listen', 'understand', 'mean'],
    emotions: ['feel', 'happy', 'sad', 'angry', 'love', 'hurt', 'care'],
    conflict: ['argue', 'fight', 'disagree', 'problem', 'issue', 'wrong'],
    support: ['help', 'support', 'there', 'together', 'appreciate', 'thank'],
    future: ['plan', 'future', 'goal', 'dream', 'hope', 'want'],
    intimacy: ['miss', 'close', 'touch', 'kiss', 'hug', 'intimate'],
    trust: ['trust', 'honest', 'truth', 'lie', 'faithful', 'believe'],
    boundaries: ['space', 'time', 'need', 'want', 'respect', 'boundary']
  };

  const topicScores = {};
  const words = text.toLowerCase().split(/\W+/);

  for (const [topic, keywords] of Object.entries(topics)) {
    const matches = words.filter(word => keywords.includes(word));
    if (matches.length > 0) {
      topicScores[topic] = {
        score: matches.length / words.length,
        matches: matches
      };
    }
  }

  return {
    scores: topicScores,
    dominant: Object.entries(topicScores)
      .sort(([,a], [,b]) => b.score - a.score)[0]?.[0]
  };
}

function analyzeMessageStructure(text: string) {
  const messages = text.split(/\n+/);
  
  return {
    messageCount: messages.length,
    structure: messages.map(msg => ({
      length: msg.length,
      hasQuestion: msg.includes('?'),
      hasEmoticon: Boolean(msg.match(/[:;]-?[\)(\[\]\\\/PpD]/)),
      isShout: msg === msg.toUpperCase() && msg.length > 3
    }))
  };
}

function analyzeRelationshipIndicators(text: string) {
  const indicators = {
    positiveInteractions: [
      'love', 'appreciate', 'thank', 'care', 'support', 'understand'
    ],
    negativeInteractions: [
      'hate', 'never', 'always', 'whatever', 'fine', 'whatever'
    ],
    repairAttempts: [
      'sorry', 'apologize', 'my fault', 'didn\'t mean', 'forgive'
    ],
    futureOrientation: [
      'will', 'going to', 'plan', 'future', 'soon', 'tomorrow'
    ]
  };

  const words = text.toLowerCase().split(/\W+/);
  const analysis = {};

  for (const [category, phrases] of Object.entries(indicators)) {
    analysis[category] = phrases.filter(phrase => 
      text.toLowerCase().includes(phrase)
    ).length;
  }

  return analysis;
}