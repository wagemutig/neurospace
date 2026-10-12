# Accounts setup (Supabase, Google, Apple)

The app runs without accounts until the two Supabase values are set. Setting them switches
on sign-in, the name step, and saving finished exercises to the account.

## 1. Supabase project

1. Create a project at supabase.com, in an EU region (Frankfurt is the closest option).
2. Open **SQL Editor**, paste `supabase/migrations/0001_accounts.sql` and run it.
   This creates `profiles` and `sessions` with row-level security on both.
3. Open **Project Settings → API**. Copy the **Project URL** and the **anon public** key.

## 2. Sign-in providers

**Authentication → Sign In / Providers**

- **Google:** create an OAuth client in Google Cloud Console (Web application). Its redirect URI is
  `https://<project-ref>.supabase.co/auth/v1/callback`. Paste the client ID and secret into Supabase.
- **Apple:** create a Services ID in the Apple Developer account with the same callback URL.
  Paste the Services ID and the generated secret into Supabase.

**Authentication → URL Configuration**

- Site URL: `https://neurospace-rho.vercel.app`
- Redirect URLs (allow-list):
  - `https://neurospace-rho.vercel.app/auth/callback`
  - `http://localhost:3000/auth/callback`
  - the Vercel preview URL pattern, for example `https://*-wagemutigs.vercel.app/auth/callback`

Supabase only redirects to URLs on this list, so the sign-in can't be sent to another site.

## 3. Vercel environment variables

Project Settings → Environment Variables, for **Production** and **Preview**:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

These are read at build time. Redeploy after adding them.

## 4. Local development

Copy `.env.example` to `.env.local` and fill in the two values. Then run `npm run dev`.

## What the flow does

1. **Willkommen** (`/willkommen`): sign in with Google or Apple.
2. **Callback** (`/auth/callback`): Supabase returns the person here. A new person goes to the name step.
3. **Name** (`/onboarding/name`): saves the first name to `profiles`.
4. **App** (`/`, `/verlauf`, `/uebung/...`): requires a signed-in person with a name.
5. **Sessions:** each finished exercise is also saved to `sessions` for that account.

Progress shown on Heute and Verlauf is still read from this browser. Signing in on another device
does not bring that progress along yet.

## Data and privacy

- Sensor readings from the phone never leave the device and are never stored.
- Deleting an auth user removes their profile and sessions (`on delete cascade`).
- Health-related data: keep it in the EU region, and check with a data protection adviser before
  launch. Swiss nDSG and EU GDPR both apply to this kind of data.
