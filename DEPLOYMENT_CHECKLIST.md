# 🚀 Deployment Checklist - CRITICAL OAuth Configuration

**⚠️ READ THIS BEFORE DEPLOYING TO PRODUCTION ⚠️**

When you deploy to Netlify (or any production environment), you **MUST** update OAuth redirect URLs or authentication will fail with 400/401 errors.

---

## 📋 Pre-Deployment Checklist

### 1. Get Your Production URL
After deploying to Netlify:
- Your URL will be: `https://[your-site-name].netlify.app`
- Example: `https://ucas-consortium.netlify.app`
- **Write it down now**: ___________________________

### 2. Update Supabase Configuration

**Go to**: [Supabase Dashboard](https://supabase.com/dashboard) → Your Project → Authentication → URL Configuration

**Update these fields**:

```
Site URL:
  Change from: http://localhost:8888
  Change to:   https://[your-site-name].netlify.app

Redirect URLs (add both):
  ✅ https://[your-site-name].netlify.app
  ✅ https://[your-site-name].netlify.app/**
  
Keep localhost URLs for development:
  ✅ http://localhost:8888
  ✅ http://localhost:8888/**
```

**Why**: Supabase only redirects to whitelisted URLs. Without this, OAuth will fail with "redirect_uri_mismatch" errors.

### 3. Update GitHub OAuth App

**Go to**: [GitHub Settings](https://github.com/settings/developers) → OAuth Apps → "Consortium"

**Update these fields**:

```
Homepage URL:
  Change from: http://localhost:8888
  Change to:   https://[your-site-name].netlify.app

Authorization callback URL:
  KEEP THIS: https://kxctrosgcockwtrteizd.supabase.co/auth/v1/callback
  (This should NOT change - it's the Supabase URL, not your site URL)
```

**Why**: GitHub checks the homepage URL. The callback URL stays the same because Supabase handles the OAuth flow.

### 4. Update Google OAuth App

**Go to**: [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials → Your OAuth 2.0 Client

**Update these fields**:

```
Authorized JavaScript origins:
  Add: https://[your-site-name].netlify.app
  Keep: http://localhost:8888 (for development)

Authorized redirect URIs:
  KEEP THIS: https://kxctrosgcockwtrteizd.supabase.co/auth/v1/callback
  (This should NOT change - it's the Supabase URL, not your site URL)
```

**Why**: Google requires explicit origin whitelisting for security.

### 5. Verify Environment Variables in Netlify

**Go to**: Netlify Dashboard → Your Site → Site settings → Environment variables

**Ensure these are set**:

```bash
SUPABASE_URL=https://kxctrosgcockwtrteizd.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4Y3Ryb3NnY29ja3d0cnRlaXpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3ODA4MzIsImV4cCI6MjA4MTM1NjgzMn0.F9yb5rkd9UMLL3e7fD4xYWEVgIJgVR8HpMDcG84SMPE
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]

# Plus all your API keys:
ANTHROPIC_API_KEY=...
OPENAI_API_KEY=...
TAVILY_API_KEY=...
BRAVE_API_KEY=...
SERPER_API_KEY=...
# etc.
```

**Why**: Netlify Functions need these to connect to Supabase and AI providers.

### 6. Test OAuth Flow in Production

After deploying and updating all URLs:

1. **Clear browser cache** (or use Incognito mode)
2. Go to `https://[your-site-name].netlify.app`
3. Open DevTools Console (F12)
4. Click "Sign In" → "GitHub"
5. **Expected**: Redirect to GitHub → authorize → redirect back → signed in ✅
6. **If it fails**: Check console for errors, verify all URLs above

Common errors:
- `redirect_uri_mismatch` → Check Supabase/GitHub/Google redirect URLs
- `Invalid API key` → Check Netlify environment variables
- `CORS error` → Check Supabase Site URL and Authorized Origins

---

## 🔄 Quick Reference: URL Changes

| Configuration | Development | Production |
|--------------|-------------|------------|
| **Your App** | `http://localhost:8888` | `https://[site].netlify.app` |
| **Supabase Site URL** | `http://localhost:8888` | `https://[site].netlify.app` |
| **Supabase Redirect URLs** | `localhost:8888` + `localhost:8888/**` | Add production URLs (keep localhost) |
| **GitHub Homepage** | `http://localhost:8888` | `https://[site].netlify.app` |
| **GitHub Callback** | `https://kxctrosgcockwtrteizd.supabase.co/auth/v1/callback` | **NO CHANGE** |
| **Google Callback** | `https://kxctrosgcockwtrteizd.supabase.co/auth/v1/callback` | **NO CHANGE** |

---

## 📝 Post-Deployment Verification

After updating all URLs, verify:

- [ ] Can sign in with GitHub on production site
- [ ] Can sign in with Google on production site
- [ ] User profile shows correct avatar/email
- [ ] Research sessions sync to Supabase
- [ ] Can access from multiple devices
- [ ] Localhost development still works

---

## 🆘 Troubleshooting

### Error: "redirect_uri_mismatch"
**Problem**: OAuth provider doesn't recognize your redirect URL  
**Fix**: Double-check Supabase Redirect URLs include your production URL

### Error: "Invalid API key"
**Problem**: Netlify Functions can't connect to Supabase  
**Fix**: Verify `SUPABASE_ANON_KEY` in Netlify environment variables

### Error: User signs in but gets logged out immediately
**Problem**: Supabase Site URL doesn't match your production URL  
**Fix**: Update Site URL in Supabase Dashboard

### Error: CORS error on auth requests
**Problem**: Google OAuth origins not configured  
**Fix**: Add production URL to Google Cloud Console Authorized Origins

---

## 📚 Related Documentation

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [GitHub OAuth Apps](https://docs.github.com/en/apps/oauth-apps)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)
- [Netlify Environment Variables](https://docs.netlify.com/environment-variables/overview/)

---

**💡 Pro Tip**: Bookmark this file! You'll need it every time you:
- Deploy to a new environment
- Change your site URL
- Set up a staging environment
- Troubleshoot OAuth issues

---

*Last Updated: December 16, 2025*  
*Tested on: Netlify deployment with Supabase + GitHub OAuth*
