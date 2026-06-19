import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Resend } from "https://esm.sh/resend@2.0.0"

const resend = new Resend(Deno.env.get('RESEND_API_KEY') || '')

serve(async (req) => {
  try {
    const { to, subject, html } = await req.json()
    
    if (!to || !subject || !html) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    const { data, error } = await resend.emails.send({
      from: 'PharmaLink Tunisia <noreply@pharmalink.tn>',
      to,
      subject,
      html
    })
    
    if (error) {
      console.error('Email send error:', error)
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    return new Response(JSON.stringify({ success: true, data }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error in send-email function:', error)
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})
