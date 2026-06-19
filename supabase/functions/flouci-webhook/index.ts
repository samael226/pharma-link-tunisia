import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
)

const FLOUCI_API_KEY = Deno.env.get('FLOUCI_API_KEY') || ''
const FLOUCI_WEBHOOK_SECRET = Deno.env.get('FLOUCI_WEBHOOK_SECRET') || ''

serve(async (req) => {
  // Verify webhook signature
  const signature = req.headers.get('x-flouci-signature')
  const body = await req.text()
  
  if (!signature || !FLOUCI_WEBHOOK_SECRET) {
    return new Response('Missing signature or webhook secret', { status: 400 })
  }

  // Simple signature verification (adjust based on Flouci's actual implementation)
  const expectedSignature = crypto.subtle
    .digest('SHA-256', new TextEncoder().encode(FLOUCI_WEBHOOK_SECRET + body))
    .then(hash => Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join(''))
  
  const actualSignature = await expectedSignature
  
  if (signature !== actualSignature) {
    console.error('Webhook signature verification failed')
    return new Response('Invalid signature', { status: 400 })
  }

  console.log('Received Flouci webhook')

  try {
    const data = JSON.parse(body)
    const eventType = data.type
    const paymentData = data.data

    console.log(`Received event: ${eventType}`)

    switch (eventType) {
      case 'payment.success': {
        const { payment_id, amount, metadata } = paymentData
        const subscriptionId = metadata?.subscription_id
        const pharmacyId = metadata?.pharmacy_id
        
        if (pharmacyId && subscriptionId) {
          // Update subscription to active
          await supabase
            .from('subscriptions')
            .update({ 
              status: 'active',
              current_period_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
            })
            .eq('id', subscriptionId)
          
          // Create payment record
          await supabase
            .from('payments')
            .insert({
              invoice_id: metadata?.invoice_id,
              amount_tnd: amount,
              payment_method: 'flouci',
              payment_id: payment_id,
              status: 'success',
              metadata: paymentData
            })
        }
        break
      }
      
      case 'payment.failed': {
        const { payment_id, metadata } = paymentData
        const subscriptionId = metadata?.subscription_id
        
        if (subscriptionId) {
          // Mark subscription as past_due
          await supabase
            .from('subscriptions')
            .update({ status: 'past_due' })
            .eq('id', subscriptionId)
          
          // Create failed payment record
          await supabase
            .from('payments')
            .insert({
              invoice_id: metadata?.invoice_id,
              amount_tnd: paymentData.amount,
              payment_method: 'flouci',
              payment_id: payment_id,
              status: 'failed',
              metadata: paymentData
            })
        }
        break
      }
      
      default:
        console.log(`Unhandled event type: ${eventType}`)
    }
  } catch (error) {
    console.error('Error processing webhook:', error)
    return new Response('Error processing webhook', { status: 500 })
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 })
})
