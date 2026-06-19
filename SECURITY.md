# PharmaLink Tunisia - Security Guide

## Security Best Practices

### Environment Variables

- **Never commit `.env` files** to version control
- Use `.env.example` as a template
- Rotate secrets regularly
- Use different keys for development and production

### Supabase Security

1. **Row Level Security (RLS):**
   - All tables have RLS enabled
   - Policies restrict access based on user roles
   - Service role key only used in edge functions

2. **Authentication:**
   - Supabase Auth handles user authentication
   - JWT tokens validated on every request
   - Session management handled by Supabase

3. **Storage Policies:**
   - Prescription files stored in private bucket
   - Users can only access their own files
   - Branch staff can access files for their branch

### Stripe Security

1. **Webhook Verification:**
   - All webhook signatures verified
   - Webhook secret stored in Supabase secrets
   - Only handle verified events

2. **Payment Processing:**
   - Never store full card details
   - Use Stripe Elements for PCI compliance
   - All sensitive data handled by Stripe

### API Security

1. **Rate Limiting:**
   - Implement rate limiting on public endpoints
   - Use Supabase rate limiting features

2. **Input Validation:**
   - Validate all user inputs
   - Sanitize data before database operations
   - Use parameterized queries

3. **CORS:**
   - Configure CORS in Supabase
   - Only allow trusted domains

### Data Protection

1. **Encryption:**
   - All data encrypted in transit (HTTPS)
   - Supabase encrypts data at rest

2. **Backup:**
   - Daily automated backups
   - Point-in-time recovery enabled
   - Backup retention: 30 days

3. **Audit Logging:**
   - All sensitive actions logged
   - Track who did what and when
   - Logs stored in `audit_logs` table

### User Security

1. **Password Requirements:**
   - Minimum 8 characters
   - Enforced by Supabase Auth

2. **Session Management:**
   - Sessions expire after inactivity
   - Users can log out from all devices

3. **Role-Based Access:**
   - Five user roles: patient, pharmacist, pharmacy_owner, supplier, admin
   - Each role has specific permissions
   - Admin can manage all aspects

### Monitoring

1. **Sentry Integration:**
   - Error tracking enabled
   - Performance monitoring
   - Alert on critical errors

2. **Supabase Logs:**
   - Monitor database queries
   - Track authentication attempts
   - Review edge function logs

### Security Checklist

- [ ] Environment variables secured
- [ ] RLS policies reviewed and tested
- [ ] Webhook verification implemented
- [ ] CORS configured
- [ ] Rate limiting enabled
- [ ] Input validation implemented
- [ ] Audit logging enabled
- [ ] Backup schedule configured
- [ ] Sentry integration tested
- [ ] Security audit completed

### Incident Response

1. **Security Incident:**
   - Immediately revoke compromised keys
   - Notify affected users
   - Review audit logs
   - Document the incident

2. **Data Breach:**
   - Identify affected data
   - Notify users within 72 hours
   - Work with Supabase support
   - Implement additional safeguards
