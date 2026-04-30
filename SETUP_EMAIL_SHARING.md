# Setup: Email-Based Task Sharing

## Overview

This feature allows users to share tasks and subtasks with any email address, even if the recipient doesn't have a TaskFlow account yet. The system will:

1. **Send an email invitation** when a task/subtask is shared
2. **Auto-link assignments** when the recipient signs up with that email
3. **Support pending assignments** until the recipient accepts

---

## Database Setup

### 1. Apply Migrations

Run these migrations in Supabase:

```bash
# First, apply the collaboration system migration
supabase db push supabase/migrations/20240428000000_add_collaboration_system.sql

# Then apply the email sharing support migration
supabase db push supabase/migrations/20240428_add_email_sharing_support.sql

# Finally, apply the user RLS fix
supabase db push supabase/migrations/20240428_fix_users_rls_for_search.sql
```

---

## Email Service Setup (Resend)

### 1. Create a Resend Account

- Go to [resend.com](https://resend.com)
- Sign up for a free account
- Create an API key

### 2. Configure Supabase Edge Function

In Supabase Dashboard:

1. Go to **Edge Functions** → **send-task-invitation**
2. Add environment variables:
   - `RESEND_API_KEY`: Your API key from Resend

```bash
# Or via CLI:
supabase secrets set RESEND_API_KEY="your_api_key_here"
```

### 3. Deploy the Edge Function

```bash
# Deploy to Supabase
supabase functions deploy send-task-invitation
```

---

## How It Works

### Sharing Flow

```
User A clicks "Compartir"
    ↓
Enters recipient email (any email)
    ↓
System creates task_assignments with:
  - shared_to_email: "recipient@example.com"
  - shared_to_id: NULL (if user doesn't exist)
  - status: 'pending'
    ↓
Edge function sends email to recipient
    ↓
Toast: "Tarea compartida con recipient@example.com"
```

### Signup & Auto-Link Flow

```
Recipient receives email: "Felipe te compartió una tarea"
    ↓
Recipient signs up with: recipient@example.com
    ↓
Trigger: link_pending_assignments_on_signup()
    ↓
All pending assignments for that email get linked:
  - shared_to_id: (new user's ID)
  - shared_to_email: still stored
    ↓
Recipient logs in → sees pending assignments
    ↓
Recipient clicks "Aceptar" → task appears in normal list
```

---

## Component Changes

### 1. ShareModal.tsx
- **Before**: Required user selection from search
- **After**: Simple email input, no validation needed
- **Benefit**: Can share with anyone, even non-registered users

### 2. TaskStore.ts - `shareTask()` & `shareSubtask()`
- Tries to find user, but doesn't require them to exist
- Sets `shared_to_id` if user exists, `shared_to_email` always
- Calls edge function to send email invitation
- Email errors are non-blocking (assignment still created)

### 3. TaskStore.ts - `fetchPendingAssignments()`
- Now queries assignments by both `shared_to_id` AND `shared_to_email`
- Users can see pending assignments before signing up (after email is verified)

---

## Database Schema Changes

### task_assignments
```sql
-- NEW columns
shared_to_email TEXT          -- Email of recipient (can be non-user)
-- MODIFIED columns
shared_to_id UUID             -- Now nullable
```

### subtask_assignments
```sql
-- Same changes as task_assignments
```

### RLS Policies Updated
- Tasks/subtasks now visible if:
  - User ID matches `shared_to_id`, OR
  - User email matches `shared_to_email`
- New trigger auto-links assignments on user signup

---

## Email Template

Recipients receive emails like:

**Subject**: `Felipe te compartió una tarea: Diseñar nuevo logo`

**Content**:
```
¡Tienes una nueva tarea compartida! 📋

Hola,

Felipe te ha compartido una tarea en TaskFlow:

┌─────────────────────────┐
│ Tarea: Diseñar nuevo    │
│         logo            │
└─────────────────────────┘

Esta tarea está pendiente de tu aceptación. Una vez que
la aceptes, podrás verla en tu lista de tareas y completarla.

[Inicia sesión en TaskFlow]

Si no tienes una cuenta en TaskFlow, podrás crear una
con este mismo email y acceder a la tarea compartida.
```

---

## Testing

### Test Email Sharing with Non-Registered User

1. **As User A**: Share task with `newuser@example.com`
2. **Check Resend Dashboard**: Verify email was sent
3. **Check Supabase**: Verify assignment created with:
   - `shared_to_email: newuser@example.com`
   - `shared_to_id: null`
4. **As New User**: Sign up with `newuser@example.com`
5. **Check**: Assignment auto-linked (`shared_to_id` now populated)
6. **In App**: Should see pending assignment in "Compartidas" tab
7. **Accept**: Task moves to normal list

### Test Email Sharing with Registered User

1. **As User A**: Share task with `existinguser@example.com`
2. **Check Supabase**: Assignment created with:
   - `shared_to_email: existinguser@example.com`
   - `shared_to_id: (existing user ID)`
3. **As Existing User**: Should see pending assignment immediately
4. **Accept**: Works as before

---

## Troubleshooting

### Email Not Sending
- Check Resend API key in Supabase secrets
- Check Resend dashboard for rate limits (free tier: 100/day)
- Check Supabase Edge Function logs for errors
- Verify email address in error response

### Assignment Not Auto-Linking
- Check trigger exists: `on_user_signup_link_assignments`
- Check function: `link_pending_assignments_on_signup()`
- Verify email case sensitivity (both should be lowercase)
- Check user creation time vs assignment creation time

### Assignment Not Visible After Signup
- Check RLS policies include email checks: `auth.jwt() ->> 'email'`
- Verify user JWT contains email claim
- Check `shared_to_email` is lowercase
- Verify assignment `status = 'pending'`

---

## Future Enhancements

- [ ] Resend email confirmation delivery tracking
- [ ] Webhook to handle bounced emails
- [ ] Admin interface to resend invitations
- [ ] Bulk sharing (share with multiple emails at once)
- [ ] Sharing groups/teams
- [ ] Scheduled reminders for pending assignments
