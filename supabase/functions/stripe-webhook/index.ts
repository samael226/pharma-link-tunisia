import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import Stripe from "https://esm.sh/stripe@14.21.0"

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
})

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
)

serve(async (req) => {
  const signature = req.headers.get('Stripe-Signature')
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
  
  if (!signature || !webhookSecret) {
    return new Response('Missing signature or webhook secret', { status: 400 })
  }

  const body = await req.text()
  
  let event: Stripe.Event
  
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error(`Webhook signature verification failed:`, err)
    return new Response('Invalid signature', { status: 400 })
  }

  console.log(`Received event: ${event.type}`)

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const subscriptionId = session.subscription as string
        const pharmacyId = session.metadata?.pharmacy_id
        
        if (pharmacyId && subscriptionId) {
          await supabase
            .from('subscriptions')
            .update({ 
              status: 'active',
              current_period_ends_at: new Date(session.current_period_end * 1000).toISOString()
            })
            .eq('pharmacy_id', pharmacyId)
        }
        break
      }
      
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId = invoice.subscription as string
        
        // Find subscription by Stripe subscription ID (you'll need to add this column)
        // For now, we'll skip this and handle it manually
        console.log(`Invoice paid: ${invoice.id}`)
        break
      }
      
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId = invoice.subscription as string
        
        // Mark subscription as past_due
        console.log(`Invoice payment failed: ${invoice.id}`)
        break
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        // Mark subscription as cancelled in database
        console.log(`Subscription deleted: ${subscription.id}`)
        break
      }
      
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }
  } catch (error) {
    console.error(`Error processing webhook:`, error)
    return new Response('Error processing webhook', { status: 500 })
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 })
})
