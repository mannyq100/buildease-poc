# Supabase Authentication Setup Guide

This document outlines the process to configure Supabase authentication for the BuildEase platform.

## Environment Variables

Ensure your `.env.local` file contains the following variables:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Configuring OAuth Providers

### Google OAuth

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services > Credentials**
4. Click **Create Credentials** and select **OAuth client ID**
5. Set application type to **Web application**
6. Add the authorized JavaScript origins:
   - Your local development URL (e.g., `http://localhost:5173`)
   - Your production URL when ready
7. Add the authorized redirect URIs:
   - `https://[YOUR_PROJECT_REF].supabase.co/auth/v1/callback`
   - Your local callback URL: `http://localhost:5173/auth/callback`
8. Save and copy the **Client ID** and **Client Secret**
9. In the Supabase dashboard, go to **Authentication > Providers > Google**
10. Enable the provider and paste the Client ID and Client Secret
11. Save

### Facebook OAuth

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or select an existing one
3. Navigate to **Facebook Login > Settings**
4. Add the Valid OAuth Redirect URIs:
   - `https://[YOUR_PROJECT_REF].supabase.co/auth/v1/callback`
   - Your local callback URL: `http://localhost:5173/auth/callback`
5. Save changes
6. From the App Dashboard, copy the **App ID** and **App Secret**
7. In the Supabase dashboard, go to **Authentication > Providers > Facebook**
8. Enable the provider and paste the App ID and App Secret
9. Save

### LinkedIn OAuth

1. Go to [LinkedIn Developer Portal](https://www.linkedin.com/developers/)
2. Create a new app or select an existing one
3. Navigate to **Auth** tab
4. Add the Authorized redirect URLs:
   - `https://[YOUR_PROJECT_REF].supabase.co/auth/v1/callback`
   - Your local callback URL: `http://localhost:5173/auth/callback`
5. Save changes
6. From the app settings, copy the **Client ID** and **Client Secret**
7. In the Supabase dashboard, go to **Authentication > Providers > LinkedIn**
8. Enable the provider and paste the Client ID and Client Secret
9. Save

## Database Setup

Ensure your Supabase database has the following tables:

### Profiles Table

```sql
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique,
  name text,
  role text default 'client' check (role in ('client', 'contractor', 'owner', 'manager')),
  phone text,
  company text,
  avatar_url text,
  settings jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone
);

-- Enable RLS
alter table profiles enable row level security;

-- Set up access policies
create policy "Users can view their own profile" on profiles
  for select using (auth.uid() = id);

create policy "Users can update their own profile" on profiles
  for update using (auth.uid() = id);
```

## Testing the Implementation

Follow this checklist to test your authentication implementation:

1. **Signup Flow**
   - Create a new account with email and password
   - Verify that a user profile is created in the profiles table
   - Verify email verification process (if enabled)
   - Test signup with Google, Facebook, and LinkedIn

2. **Login Flow**
   - Test login with email and password
   - Test login with Google, Facebook, and LinkedIn
   - Verify that user session is created correctly
   - Verify redirection to dashboard after successful login

3. **Protected Routes**
   - Verify that unauthorized users are redirected to login page
   - Verify that authorized users can access protected routes
   - Test role-based route restrictions

4. **Profile Management**
   - Update profile information
   - Verify changes are saved correctly
   - Test profile picture upload (if implemented)

5. **Logout**
   - Verify that logout clears user session
   - Verify redirection to login page after logout

## Common Issues and Troubleshooting

- **CORS Issues**: Ensure your Supabase project allows your frontend domain
- **Redirect Errors**: Verify all redirect URLs are correctly set in both provider dashboards and Supabase
- **Missing Profile**: Ensure profile creation is handled in the signup flow
- **Role-Based Access**: Check that user roles are correctly assigned and verified
