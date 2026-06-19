# PharmaLink Tunisia - Deployment Guide

## Prerequisites

- Node.js 18+ installed
- Supabase account and project
- Flouci account (Tunisian payment gateway)
- Resend account
- Google Maps API key
- Sentry account (optional but recommended)

## Environment Setup

1. **Copy environment template:**
   ```bash
   cp .env.example .env.production
   ```

2. **Fill in environment variables:**
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key
   - `VITE_GOOGLE_MAPS_API_KEY`: Google Maps API key
   - `VITE_FLOUCI_API_KEY`: Flouci API key
   - `FLOUCI_WEBHOOK_SECRET`: Flouci webhook secret
   - `RESEND_API_KEY`: Resend API key
   - `VITE_SENTRY_DSN`: Sentry DSN (optional)
   - `VITE_ENVIRONMENT`: Set to `production`

## Database Setup

1. **Run migrations:**
   ```bash
   supabase db push
   ```

2. **Create storage bucket:**
   - Go to Supabase dashboard > Storage
   - Create bucket named `prescriptions`
   - Set to private
   - Configure policies (see migration file)

3. **Set up Supabase secrets:**
   - Go to Supabase dashboard > Edge Functions
   - Add secrets:
     - `FLOUCI_API_KEY`: Your Flouci API key
     - `FLOUCI_WEBHOOK_SECRET`: Your Flouci webhook secret
     - `RESEND_API_KEY`: Your Resend API key
     - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key

## Deploy Edge Functions

```bash
supabase functions deploy flouci-webhook
supabase functions deploy send-email
supabase functions deploy notify
```

## Build for Production

```bash
npm run build
```

## Deploy to Vercel (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel --prod
   ```

3. **Set environment variables in Vercel:**
   - Add all variables from `.env.production`

## Flouci Webhook Setup

1. **Get webhook URL:**
   - Your deployed URL + `/functions/flouci-webhook`

2. **Configure in Flouci:**
   - Go to Flouci dashboard > Webhooks
   - Add endpoint with your webhook URL
   - Select events: `payment.success`, `payment.failed`

## Post-Deployment Checklist

- [ ] Database migrations applied
- [ ] Storage bucket created with policies
- [ ] Edge functions deployed
- [ ] Environment variables configured
- [ ] Flouci webhook configured
- [ ] Test subscription flow with Flouci
- [ ] Test bank transfer payment
- [ ] Test prescription upload
- [ ] Test notifications
- [ ] Test delivery workflow
- [ ] Set up monitoring (Sentry)
- [ ] Configure backups
