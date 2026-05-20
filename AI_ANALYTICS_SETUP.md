# AI Finance Analytics Setup Guide

Your AI-powered finance analytics feature has been successfully implemented! Follow these steps to configure it.

## What's Been Added

1. **Supabase Edge Function** (`ai-finance-analytics`)
   - Securely handles AI API calls
   - Processes user questions and transaction data
   - Returns personalized financial insights

2. **AI Analytics Component**
   - Chat-like interface for asking questions
   - Suggested questions to get started
   - Real-time analysis of your transactions
   - Beautiful markdown-formatted responses

3. **Integration**
   - Added to main app between transaction form and transaction list
   - Automatically analyzes all your transactions
   - Works seamlessly with your existing data

## Setup Instructions

### Step 1: Get Your Google AI Studio API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Get API Key" or "Create API Key"
4. Copy your API key (starts with `AIza...`)

**Important:** This is a free API with generous limits:
- 15 requests per minute
- 1,500 requests per day
- 1 million tokens per day

### Step 2: Configure the API Key in Supabase

You need to add your API key as a secret in your Supabase project:

#### Option A: Using Supabase Dashboard (Recommended)

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Project Settings** (gear icon in sidebar)
4. Click on **Edge Functions** in the left menu
5. Scroll to **Secrets and Environment Variables**
6. Click **Add new secret**
7. Enter:
   - **Name:** `GEMINI_API_KEY`
   - **Value:** Your API key from Step 1
8. Click **Save**

#### Option B: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
supabase secrets set GEMINI_API_KEY=your_api_key_here
```

### Step 3: Test the Feature

1. Make sure you have some transactions in your app
2. Scroll to the "Análisis Financiero con IA" section
3. Try one of the suggested questions or ask your own
4. Wait for the AI response (usually takes 2-5 seconds)

## Example Questions to Ask

- ¿Cuáles son mis mayores gastos este mes?
- ¿Cómo puedo ahorrar más dinero?
- ¿En qué categorías gasto más?
- Dame consejos para mejorar mis finanzas
- ¿Cuál es mi patrón de gastos?
- ¿Dónde puedo reducir gastos?
- ¿Mi relación ingresos-gastos es saludable?
- ¿Qué porcentaje gasto en cada categoría?

## Features

### What the AI Can Do

- Analyze spending patterns across categories
- Identify areas for potential savings
- Calculate percentages and trends
- Provide personalized financial advice
- Compare income vs expenses
- Suggest budget optimizations
- Highlight unusual transactions
- Give actionable recommendations

### Data Privacy

- Your API key is stored securely in Supabase
- Transaction data is only sent to Google AI during your queries
- No data is stored by Google AI after processing
- All communication is encrypted
- The API key is never exposed to the frontend

## Troubleshooting

### "API key not configured" error
- Make sure you've added the `GEMINI_API_KEY` secret in Supabase
- Wait 1-2 minutes after adding the secret for it to propagate
- Redeploy the edge function if needed

### "Failed to get AI response" error
- Check that your API key is valid
- Verify you haven't exceeded the API rate limits
- Check your internet connection

### No response after long wait
- The API might be experiencing high load
- Try asking a simpler question
- Check if you have transactions to analyze

## Cost & Limits

### Google AI Studio (Gemini API) - FREE Tier

- **Requests:** 1,500 per day
- **Tokens:** 1 million per day
- **Rate:** 15 requests per minute

This is more than enough for personal use. Even with heavy usage (50 questions per day), you'll stay well within limits.

## Technical Details

### Architecture

```
User Question
    ↓
Frontend Component (AIFinanceAnalytics.tsx)
    ↓
Supabase Edge Function (ai-finance-analytics)
    ↓
Google Gemini API (gemini-1.5-flash)
    ↓
AI Response
    ↓
Display to User
```

### API Endpoint

The edge function is available at:
```
${VITE_SUPABASE_URL}/functions/v1/ai-finance-analytics
```

### Request Format

```json
{
  "question": "¿Cuáles son mis mayores gastos?",
  "transactions": [...]
}
```

### Response Format

```json
{
  "response": "Markdown-formatted AI response"
}
```

## Next Steps

1. Get your Google AI Studio API key
2. Add it to Supabase as `GEMINI_API_KEY`
3. Start asking questions about your finances
4. Get personalized insights and recommendations

---

**Note:** The AI provides general financial advice based on your transaction data. For specific financial planning, consult with a certified financial advisor.
