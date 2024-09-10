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

    const wishId = req.url.split('/').pop()
    const url = new URL(req.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    // Check if the user has permission to view messages for this wish
    const { data: wish, error: wishError } = await supabaseClient
      .from('wishes')
      .select('user_id')
      .eq('id', wishId)
      .single()

    if (wishError) {
      return new Response(JSON.stringify({ error: 'Wish not found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      })
    }

    // Check if the user is either the wish creator or a participant in the conversation
    const { data: userMessages, error: userMessagesError } = await supabaseClient
      .from('wish_messages')
      .select('id')
      .eq('wish_id', wishId)
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .limit(1)

    if (userMessagesError || (wish.user_id !== user.id && userMessages.length === 0)) {
      return new Response(JSON.stringify({ error: 'Unauthorized to view messages for this wish' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403,
      })
    }

    // Fetch messages
    const { data: messages, error: messagesError, count } = await supabaseClient
      .from('wish_messages')
      .select(`
        *,
        sender:sender_id(id, username, avatar_url),
        recipient:recipient_id(id, username, avatar_url)
      `, { count: 'exact' })
      .eq('wish_id', wishId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (messagesError) {
      throw messagesError
    }

    return new Response(JSON.stringify({
      messages,
      totalCount: count,
      currentPage: page,
      totalPages: Math.ceil(count / limit)
    }), {
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

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/get-wish-messages' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
