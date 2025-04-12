import { createClient } from 'npm:@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { userId, analysisResults, gottmanAnalysis } = await req.json();

    if (!userId) {
      throw new Error('User ID is required');
    }

    // Begin transaction
    const { error: deleteError } = await supabase
      .from('analysis_results')
      .delete()
      .eq('user_id', userId);

    if (deleteError) throw deleteError;

    const { error: deleteGottmanError } = await supabase
      .from('gottman_analyses')
      .delete()
      .eq('user_id', userId);

    if (deleteGottmanError) throw deleteGottmanError;

    // Insert new analysis results
    if (analysisResults?.length > 0) {
      const { error: insertError } = await supabase
        .from('analysis_results')
        .insert(
          analysisResults.map(result => ({
            user_id: userId,
            category: result.category,
            subject_a_score: result.subjectAScore,
            subject_b_score: result.subjectBScore,
            comparison: result.comparison,
            subject_a_insights: result.individualInsights.subjectA,
            subject_b_insights: result.individualInsights.subjectB,
            message_patterns: result.messagePatterns
          }))
        );

      if (insertError) throw insertError;
    }

    // Insert new Gottman analysis
    if (gottmanAnalysis?.length > 0) {
      const { error: insertGottmanError } = await supabase
        .from('gottman_analyses')
        .insert(
          gottmanAnalysis.map(analysis => ({
            user_id: userId,
            horseman: analysis.horseman,
            description: analysis.description,
            presence: analysis.presence,
            examples: analysis.examples,
            recommendations: analysis.recommendations
          }))
        );

      if (insertGottmanError) throw insertGottmanError;
    }

    return new Response(
      JSON.stringify({ success: true }),
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