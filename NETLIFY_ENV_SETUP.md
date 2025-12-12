# Netlify Environment Variables Setup

## 🔐 How to Add Environment Variables to Netlify

Your API keys are stored in `.env` (local) but need to be added to Netlify for production deployment.

### Step 1: Access Netlify Dashboard
1. Go to [app.netlify.com](https://app.netlify.com)
2. Select your site: **gamedesigner**
3. Go to **Site settings** → **Environment variables**

### Step 2: Add Environment Variables

Click **Add a variable** or **Add multiple** and add the following keys:

**Note:** Your actual API key values are stored in your local `.env` file. Copy them from there when setting up Netlify.

Required variables:
- `OPENAI_API_KEY` - OpenAI API key (starts with `sk-proj-...`)
- `ANTHROPIC_API_KEY` - Anthropic API key (starts with `sk-ant-api03-...`)
- `STABILITY_AI_API_KEY` - Stability AI key (starts with `sk-...`)
- `REPLICATE_API_TOKEN` - Replicate token (starts with `r8_...`)
- `TAVILY_API_KEY` - Tavily key (starts with `tvly-...`)
- `SERPAPI_KEY` - SerpAPI key
- `NEWS_API_KEY` - News API key
- `GIPHY_API_KEY` - Giphy API key
- `PEXELS_API_KEY` - Pexels API key
- `PIXABAY_API_KEY` - Pixabay API key
- `UNSPLASH_ACCESS_KEY` - Unsplash access key
- `UNSPLASH_SECRET_KEY` - Unsplash secret key
- `YOUTUBE_API_KEY` - YouTube API key (starts with `AIza...`)
- `OPENCLIPART_BASE_URL` - `https://openclipart.org/search/json/`
- `REDDIT_CLIENT_ID` - Reddit client ID
- `REDDIT_CLIENT_SECRET` - Reddit client secret

**To get your values:** Open your local `.env` file and copy the values from there.

### Step 3: Deploy Context (Optional)

You can set variables for specific contexts:
- **Production** - Live site
- **Deploy Previews** - Pull request previews
- **Branch Deploys** - Specific branches

For this project, set to **All** or **Production**.

### Step 4: Redeploy

After adding variables:
1. Go to **Deploys** tab
2. Click **Trigger deploy** → **Deploy site**
3. Wait for build to complete

---

## 🔒 Security Notes

✅ **Protected Files:**
- `.env` is in `.gitignore` (never committed to Git)
- `.env.example` is safe to commit (contains no real keys)
- Actual keys only exist in:
  - Your local `.env` file
  - Netlify's secure environment variables
  - This documentation file (which you can delete after setup)

❌ **Never commit:**
- `.env` file
- API keys in code
- Secrets in documentation that gets committed

---

## 🧪 Testing Locally

To test with these environment variables locally, you'll need to:

1. Ensure `.env` file exists in project root
2. Install a library to read `.env` files (if using Node.js backend)
3. Or manually configure API keys in browser (for browser-only apps)

**Note:** This project currently uses browser-based API calls with keys stored in localStorage. The `.env` file is prepared for future backend integration.

---

## 🚀 For Future Backend (Netlify Functions)

If you add Netlify Functions later:

1. Create `/netlify/functions/` directory
2. Functions will automatically have access to environment variables
3. Example:

```javascript
// netlify/functions/ai-chat.js
exports.handler = async (event, context) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  // Make API call server-side
  return {
    statusCode: 200,
    body: JSON.stringify({ result: 'success' })
  };
};
```

This keeps API keys secure on the server instead of exposing them in browser.

---

## 📝 Current Usage (Browser-Based)

Current implementation (Phase 3):
- User enters their own API key in settings modal
- Key stored in browser's localStorage
- Direct API calls from browser to Anthropic/OpenAI
- User controls their own API usage and costs

These environment variables are for **your personal API keys** when testing or if you want to provide a shared key for users.
