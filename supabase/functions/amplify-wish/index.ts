import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Get the session of the authenticated user
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    // Get the wish ID from the URL
    const wishId = req.url.split('/').pop()

    // Check if the user has available amplifications
    const { data: subscriptionData, error: subscriptionError } = await supabaseClient
      .from('user_subscriptions')
      .select('subscription_plans(features)')
      .eq('user_id', user.id)
      .single()

    if (subscriptionError) {
      throw subscriptionError
    }

    const features = subscriptionData.subscription_plans.features
    const amplificationsPerMonth = features.amplifications_per_month

    if (amplificationsPerMonth !== 'unlimited') {
      // Check if the user has used all their amplifications
      const { count, error: amplificationError } = await supabaseClient
        .from('wish_amplifications')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .gte('amplified_at', new Date(new Date().setDate(new Date().getDate() - 30)).toISOString())

      if (amplificationError) {
        throw amplificationError
      }

      if (count >= amplificationsPerMonth) {
        return new Response(JSON.stringify({ error: 'No amplifications left' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403,
        })
      }
    }

    // Check if the wish exists and belongs to the user
    const { data: wishData, error: wishError } = await supabaseClient
      .from('wishes')
      .select('*')
      .eq('id', wishId)
      .single()

    if (wishError) {
      throw wishError
    }

    if (wishData.user_id !== user.id) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403,
      })
    }

    // Insert a new record into wish_amplifications table
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30) // Set expiration to 30 days from now

    const { data: amplificationData, error: amplificationError } = await supabaseClient
      .from('wish_amplifications')
      .insert({
        wish_id: wishId,
        user_id: user.id,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single()

    if (amplificationError) {
      throw amplificationError
    }

    return new Response(JSON.stringify({ success: true, amplification: amplificationData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/amplify-wish' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
