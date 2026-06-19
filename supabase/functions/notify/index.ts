import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
)

serve(async (req) => {
  try {
    const { userId, type, title, body, data, sendEmail } = await req.json()
    
    if (!userId || !type || !title || !body) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    // Create in-app notification
    const { data: notification, error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        title,
        body,
        data
      })
      .select()
      .single()
    
    if (notificationError) {
      console.error('Notification creation error:', notificationError)
      return new Response(JSON.stringify({ error: notificationError.message }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    // Send email if requested
    if (sendEmail) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', userId)
        .single()
      
      if (profile?.email) {
        try {
          await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-email`, {
            method: 'POST',
            headers: { 
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
              to: profile.email, 
              subject: title, 
              html: body 
            })
          })
        } catch (emailError) {
          console.error('Email send error:', emailError)
          // Don't fail the request if email fails
        }
      }
    }
    
    return new Response(JSON.stringify({ success: true, notification }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error in notify function:', error)
    return new Response(JSON.stringify({ error: (error as Error).message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})
