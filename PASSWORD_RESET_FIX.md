# Password Reset Configuration Fix

## Problem
Password reset emails are redirecting to `localhost` instead of your actual application URL.

## Solution

Follow these steps to configure Supabase correctly:

### Step 1: Configure Site URL

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **URL Configuration**
3. Set the **Site URL** to your actual application URL:
   - For production: `https://your-domain.com`
   - For bolt.new: Use the preview URL provided by bolt.new
4. Click **Save**

### Step 2: Add Redirect URLs

In the same **URL Configuration** section:

1. Under **Redirect URLs**, add these URLs (replace with your actual domain):
   ```
   https://your-domain.com/reset-password
   https://your-domain.com/**
   ```

2. If you're testing locally, also add:
   ```
   http://localhost:5173/reset-password
   http://localhost:5173/**
   ```

3. Click **Save**

### Step 3: Update Email Template (Optional)

If the above doesn't work, you may need to update the email template:

1. Go to **Authentication** → **Email Templates**
2. Select **Reset Password** template
3. Find the confirmation link in the template
4. Ensure it uses: `{{ .ConfirmationURL }}`
5. The template should look like this:

```html
<h2>Reset Password</h2>
<p>Follow this link to reset your password:</p>
<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
```

### Step 4: Test the Flow

1. Go to your app and click "Forgot Password"
2. Enter your email
3. Check your email inbox
4. Click the reset password link
5. You should now be redirected to your app's `/reset-password` page

## How It Works

When a user requests a password reset:

1. The app calls `supabase.auth.resetPasswordForEmail(email, { redirectTo: '...' })`
2. Supabase sends an email with a magic link
3. The user clicks the link
4. Supabase validates the token and redirects to the URL specified
5. The URL includes query parameters: `access_token`, `refresh_token`, and `type=recovery`
6. Your app detects these parameters and shows the password reset form
7. User enters new password
8. App updates the password via `supabase.auth.updateUser({ password })`

## Common Issues

### Issue: Still redirecting to localhost
**Solution**: Clear your browser cache and cookies, then request a new reset email

### Issue: Token expired error
**Solution**: Password reset links expire after a certain time. Request a new reset email

### Issue: Invalid redirect URL error
**Solution**: Make sure you've added the exact redirect URL to the allowed list in Supabase

## Getting Your Application URL

If you're using bolt.new:
- The URL is shown in the preview panel (top bar)
- It typically looks like: `https://[random-id].bolt.new`
- Use this exact URL in the Supabase configuration

If you've deployed to production:
- Use your production domain URL
- Example: `https://michivito.com`

## Security Note

Only add URLs you control to the redirect list. Never add untrusted URLs as this could be a security risk.
