import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    const { wishId, recipientId, message } = await req.json()

    if (!wishId || !recipientId || !message) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // Check user's subscription and message limit
    const { data: subscription, error: subscriptionError } = await supabaseClient
      .from('user_subscriptions')
      .select('subscription_plans(name, features)')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (subscriptionError) {
      throw subscriptionError
    }

    const messageLimit = subscription?.subscription_plans?.features?.messages_per_wish || 20
    
    if (messageLimit !== 'unlimited') {
      const { count, error: countError } = await supabaseClient
        .from('wish_messages')
        .select('*', { count: 'exact' })
        .eq('wish_id', wishId)
        .eq('sender_id', user.id)

      if (countError) {
        throw countError
      }

      if (count >= messageLimit) {
        return new Response(JSON.stringify({ error: 'Message limit reached for this wish' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403,
        })
      }
    }

    // Create the message
    const { data: newMessage, error: messageError } = await supabaseClient
      .from('wish_messages')
      .insert({
        wish_id: wishId,
        sender_id: user.id,
        recipient_id: recipientId,
        message
      })
      .select()
      .single()

    if (messageError) {
      throw messageError
    }

    return new Response(JSON.stringify({ message: newMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 201,
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

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/create-wish-message' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
