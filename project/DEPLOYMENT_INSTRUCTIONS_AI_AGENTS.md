# AI Agent Deployment Instructions

## ✅ Changes Completed Locally

1. **✅ GroupChallenges.tsx Updated**
   - Added AI generation button
   - Added `generateAIChallenge()` function
   - Added Zap icon import
   - Form pre-fills with AI-generated template

2. **✅ Edge Function Code Created**
   - File: `/project/supabase-functions-reference/generate-group-challenge/index.ts`
   - Ready to deploy to Supabase

---

## 🚀 STEP 1: Deploy Edge Function to Supabase

### Option A: Deploy via Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard:**
   - Visit: https://supabase.com/dashboard
   - Select your FitAdapt project

2. **Navigate to Edge Functions:**
   - Click "Edge Functions" in left sidebar
   - Click "New Function" button

3. **Create Function:**
   - Name: `generate-group-challenge`
   - Copy code from: `/project/supabase-functions-reference/generate-group-challenge/index.ts`
   - Paste into editor
   - Click "Deploy Function"

4. **Verify Deployment:**
   - Function should appear in Edge Functions list
   - Status should be "Active"

### Option B: Deploy via Supabase CLI

```bash
cd /srv/proj/outskill_hackathon/project

# Initialize Supabase (if not done)
supabase init

# Create function directory
mkdir -p supabase/functions/generate-group-challenge

# Copy function code
cp supabase-functions-reference/generate-group-challenge/index.ts supabase/functions/generate-group-challenge/

# Deploy
supabase functions deploy generate-group-challenge
```

---

## 🔑 STEP 2: Verify Environment Variables

Make sure these are set in Supabase:

1. **Go to:** Settings → Edge Functions → Secrets

2. **Verify these exist:**
   - `OPENAI_API_KEY` → Your OpenAI API key
   - `SUPABASE_URL` → (auto-set)
   - `SUPABASE_SERVICE_ROLE_KEY` → (auto-set)

3. **If OPENAI_API_KEY is missing:**
   - Click "Add Secret"
   - Name: `OPENAI_API_KEY`
   - Value: `your_openai_api_key_here` (get from OpenAI dashboard)
   - Click "Save"

---

## 🧪 STEP 3: Test the AI Agents

### Test Group Challenge Coordinator (New):

1. **Open App:** http://localhost:5173 (or your Vercel URL)
2. **Login** to your account
3. **Go to:** Group Challenges page
4. **Click:** "AI Generate" (purple button)
5. **Expected Result:**
   - Loading spinner appears
   - After 3-5 seconds, form modal opens
   - Title, description, type, difficulty, max participants pre-filled
   - Description is 250-400 words, enthusiastic, has emojis
   - Can customize and create

6. **If Error Occurs:**
   - Check browser console for error message
   - Check Supabase Edge Functions logs:
     - Dashboard → Edge Functions → generate-group-challenge → Logs
   - Common issues:
     - OPENAI_API_KEY not set
     - Function not deployed
     - CORS errors (check Edge Function has CORS headers)

### Test Personal Challenge Generator (Existing):

1. **Go to:** Challenges page
2. **Click:** "Generate AI Challenge"
3. **Expected Result:**
   - Challenge created in database
   - Shows in Active Challenges list
   - Has title, description, difficulty

---

## 🎨 What Changed - Visual Guide

### Group Challenges Page:

**BEFORE:**
```
[Header]
  "Group Challenges"
  [Create Challenge] ← Only button
```

**AFTER:**
```
[Header]
  "Group Challenges"
  [AI Generate] [Create Manually] ← Two buttons, AI is purple
```

### User Flow:

**Option 1: AI-Assisted (NEW)**
1. Click "AI Generate"
2. Wait 3-5 seconds
3. Modal opens with pre-filled template
4. Review and customize
5. Click "Create Challenge"

**Option 2: Manual**
1. Click "Create Manually"
2. Fill all fields from scratch
3. Click "Create Challenge"

---

## 📊 Agent Comparison

| Feature | Personal Coach | Group Coordinator |
|---------|---------------|-------------------|
| **Page** | Challenges | Group Challenges |
| **Button** | "Generate AI Challenge" (blue with Zap icon) | "AI Generate" (purple with Zap icon) |
| **Edge Function** | `generate-challenge` | `generate-group-challenge` |
| **Creates** | Individual challenge in DB | Pre-fills form template |
| **Tone** | Motivating coach, holistic wellness | Enthusiastic event planner, community-focused |
| **Output** | Challenge title + description + difficulty | Title + 250-400 word invitation + all fields |
| **Focus** | Exercise + nutrition + sleep + recovery | Community + inclusivity + pace groups |

---

## 🔍 Troubleshooting

### Error: "Failed to generate challenge template"

**Check:**
1. Edge Function deployed?
   - Supabase Dashboard → Edge Functions → Look for "generate-group-challenge"

2. OpenAI API key set?
   - Settings → Edge Functions → Secrets → OPENAI_API_KEY exists?

3. Network issues?
   - Browser DevTools → Network tab → Check request status

### Error: "No authorization header"

**Fix:**
- Refresh browser
- Re-login to app
- Session token might be expired

### Error: "Invalid AI response format"

**Cause:**
- OpenAI returned non-JSON response
- Check Edge Function logs for raw OpenAI response

**Fix:**
- Retry (sometimes OpenAI has hiccups)
- Check OpenAI API status: https://status.openai.com/

### Form doesn't pre-fill

**Check:**
1. Modal opened? (should auto-open after AI generation)
2. Browser console errors?
3. Success message appeared?
   - Should say: "🎉 AI template generated! Review and customize before creating."

---

## 🎯 Next Steps (Optional Enhancements)

### Phase 3: Agent Communication

If you want agents to share insights:

1. **Create table:**
   ```sql
   CREATE TABLE agent_insights (
     id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
     user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
     agent_type TEXT NOT NULL,
     insight_type TEXT NOT NULL,
     insight_data JSONB NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   ALTER TABLE agent_insights ENABLE ROW LEVEL SECURITY;

   CREATE POLICY "Users can view own insights"
     ON agent_insights FOR SELECT
     USING (auth.uid() = user_id);

   CREATE POLICY "Service role can insert insights"
     ON agent_insights FOR INSERT
     WITH CHECK (true);
   ```

2. **Update Edge Functions to store/read insights**
   - See: `/resources/AI_Agent_Implementation_Guide.md` → Step 4

### Phase 4: Improve Personal Coach Prompt

Update `generate-challenge` Edge Function with full Personal Coach system prompt from:
`/resources/AI_Agent_System_Prompts.md` → Section 1

---

## 📝 Commit These Changes

After testing works:

```bash
cd /srv/proj/outskill_hackathon

git add .
git commit -m "$(cat <<'EOF'
Add AI Group Challenge Coordinator agent

Frontend changes:
- Updated GroupChallenges.tsx with AI generation button
- Added generateAIChallenge() function to call Edge Function
- Form pre-fills with AI-generated template
- Purple "AI Generate" button with Zap icon

Backend changes:
- Created generate-group-challenge Edge Function
- Uses Group Challenge Coordinator system prompt
- Returns community-focused, inclusive event invitations
- 250-400 word descriptions with emojis and pace groups

Both AI agents now operational:
- Personal Coach (Challenges page) - Individual holistic wellness
- Group Coordinator (Group Challenges page) - Community events

🤖 Generated with Claude Code

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
EOF
)"

git push
```

---

## ✅ Verification Checklist

- [ ] Edge Function deployed to Supabase
- [ ] OPENAI_API_KEY environment variable set
- [ ] "AI Generate" button appears on Group Challenges page
- [ ] Button is purple (not blue)
- [ ] Clicking button shows loading spinner
- [ ] Modal opens with pre-filled form after 3-5 seconds
- [ ] Description is long (250-400 words) and enthusiastic
- [ ] Can customize fields before creating
- [ ] Creating challenge works normally
- [ ] Challenge appears in list after creation

---

**Status: Ready for deployment!**

The code changes are complete. You just need to deploy the Edge Function to Supabase and test.
