Vibe Coding Hackathon Workbook
Objective: Build a working MVP in 3 days using vibe coding tools
How to use this
Pick one product idea from the list here and stick to it.
Follow Phase 1 → Phase 2 → Phase 3 in order.
Use any stack: AI Studio / Bolt / Lovable / Replit / Emergent / etc.
Focus on one strong end-to-end flow, not 20 scattered features.



PHASE 1 - IDEATION
From vague idea to sharp MVP scope
Step 1 - Product and user basics
1.1 Product one-liner
Product name (working):
 __________________________


One-liner (For X, I am building Y so they can Z):

 For ____________________, I am building ____________________ so they can ____________________.


1.2 Who is this for
Primary user role:
 __________________________


Where they use this (context):
 __________________________


Top 3 pains today:


__________________________


__________________________


__________________________


1.3 MVP success for this hackathon
By the end of 3 days:
A user should be able to:
 _________________________________________________________


Simple success metric for the demo (one line):
 _________________________________________________________



Step 2 - Deepen the problem with 5 Whys
2.1 Problem statement v0
Problem v0:
 _________________________________________________________
2.2 5 Whys table
Why #
Question
Your answer
1
Why is this a problem for your user?


2
Why does that happen right now?


3
Why haven’t existing tools solved this well?


4
Why is your user still stuck?


5
Why does solving this now matter for them?



2.3 Final problem statement
Final problem statement:
 _________________________________________________________
This is the line you reuse in prompts, PRD, and demo.

Step 3 - Competitor scan and AI feature analysis
Screenshots → AI analysis → features list.
3.1 Collect references
Pick 2–3 products closest to what you want to build.
Take screenshots of key pages:


Pricing pages


Feature pages


Sample UI / dashboards


Product / tool
Links or pages you checked
What they do well 
(2 points)
What frustrates users 
(2 points)

























3.2 AI feature extraction
Paste screenshots or text into your LLM:
“I am building a product similar to these tools: [brief description of each].
 Here are screenshots / notes from their feature and pricing pages.
 Extract all unique features into a table with columns:
 Feature | What it does | Why users care | Which tool(s) have it.
 Highlight any patterns and common ‘must have’ features.”
Where you saved that table (doc / link / file):
 _________________________________________________________


Optional: Mark potential differentiators now with a ⭐ in that table.

Step 4 - MVP scope with MoSCoW (core vs differentiators)
4.1 Feature dump
List everything from your head + AI feature table:
________________________________


________________________________


________________________________


________________________________


4.2 MoSCoW prioritisation
Use this table and mark differentiators with a ⭐ in the name if needed.
Feature
M (Must)
S (Should)
C (Could)
W (Won't now)
Differentiator? (⭐ / -)
Why you placed it here


☐
☐
☐
☐






☐
☐
☐
☐






☐
☐
☐
☐





Guidance:
Must: Without it, product fails its main promise.


Should: Strongly expected, but can live without for v1.


Could: Candy. Only if time remains.


Won’t: Explicitly not in this 3-day build.


4.3 Final MVP scope for the hackathon
Single Must-have flow you commit to ship:
 _________________________________________________________


Up to 2 Should-haves:


_____________________________


_____________________________


Features you park deliberately (for later):


_____________________________


_____________________________



PHASE 1 - END CHECKLIST
Final problem statement is clear


Primary user and context defined


Competitor screenshots + feature table done


Features prioritised with MoSCoW


One must-have flow + up to 2 should-haves locked



PHASE 2 - BUILDING
Architecture, PRD, starting prompt, and first build
Step 5 - Architecture: screens, flows, data, backend
5.1 Big picture architecture
Front-end (what the user sees and clicks):
 Screens: ______________________________________________


Back-end / automations (what runs behind the scenes):
 Workflows / services: _________________________________


Data store (where data lives):
 Sheets / DB / built-in storage: _______________________


External APIs / services (if any):
 Email / AI models / webhooks / others: ________________


5.2 Screens & actions table
Screen name
Who uses it
Key actions (buttons / flows)
Data needed / shown
e.g. Task Dashboard
Logged-in user
Create task, update status, mark done
Task title, due date, status, assignee


















Step 6 - PRD with AI
Ask Claude to create a proper PRD.
6.1 PRD prompt
Use this in your LLM:
“You are a senior product manager.
 I want to build an MVP in a no-code / vibe coding tool.
Problem statement:
 [Paste from Step 2.3]
Target user and top 3 pains:
 [Paste from Step 1.2].
Prioritised features using MoSCoW (mark differentiators with ⭐):
 [Paste your table].
Architecture draft:
Front-end screens: [list]


Back-end workflows / automations: [list]


Data store: [sheet / DB + important fields]


External services / APIs: [list]


Tasks:
Write a concise PRD with: Goal, Users, Scope (Must + chosen Shoulds), Out of Scope, Core user flows, Data model (main tables and fields), Non-functional constraints.


Write a step-by-step build plan for a vibe coding tool.”


6.2 Capture your PRD
PRD location (doc / link / notes):
 _________________________________________________________


Two key flows to build first:


_____________________________


_____________________________



Step 7 - Platform optimisation: convert PRD into a starting prompt
Bolt.new best practices → single starting prompt
https://support.bolt.new/building/build-your-first-app.
7.1 Collect platform guidelines
Chosen tool (Bolt / Lovable / Replit / etc.):
 _____________________________


Link or notes from its “best practices” / docs:
 _________________________________________________________


7.2 Starting prompt generator
Use your LLM again:
“Here is my PRD:
 [Paste PRD]
Here are best practices / docs for [tool name]:
 [Paste key points or link + summary].
Rewrite this PRD as one single starting prompt optimised for [tool name].
Use the tool’s recommended format.


Include entities, screens, data model, and must-have flow.


Keep it copy-paste ready for the builder.”


7.3 Final starting prompt
Paste your tool-specific starting prompt here or link it:

 _________________________________________________________



Step 8 - Day 1 & Day 2 build execution
Day 1 - Outcome
Complete Phase 1


Complete Steps 5, 6, 7


Have a PRD + starting prompt ready


Day 1 checklist:
Ideation done and frozen


Architecture sketched


PRD written


Tool-specific starting prompt ready


Day 2 - Build the first version
In your chosen tool:
Create a new project.


Paste the starting prompt and generate the first version.


Set up core data model (tables / collections / sheets).


Ensure the must-have flow is present.


If parts are missing, use targeted prompts to:


Add missing screens


Fix obvious UI gaps


Align flows with PRD


Day 2 checklist:
Project created in tool


First build generated from starting prompt


Data model exists


Must-have flow runs at least once end-to-end (even if rough)

OPTIONAL SECTION - GITHUB FOR BACKUP & COLLAB
(Use only if your team wants shared code)
Goal:
Keep your code in one place and let everyone update it.
This is a simple path: one main branch, small commits, no complex Git.
Step G1 - One repo per team
One teammate goes to github.com → New repository.


Name it: aiap-<cohort>-<team-name> or similar.


Visibility: Private is fine.


Click Create repository.


Step G2 - Add collaborators
In the repo, go to Settings → Collaborators.


Add your teammates by GitHub username or email.


Give them Write access.


Now everyone can open the same repo.
Step G3 - Simple “back code and collaborate” workflow
Use this pattern during the hackathon:
One person is Code Owner for the repo.


Others send code snippets or files to Code Owner (from Bolt / editor export).


Code Owner:


Pulls latest code from GitHub (if using Git) or edits in web UI.


Pastes / uploads updated files.


Clicks Commit with a clear message:


“Add itinerary screen”


“Fix activity edit flow”


Repeat this whenever a feature is stable.
Team rules (keep it simple):
Only commit working code.
One person commits at a time.
If something breaks, Code Owner reverts last change or fixes and commits again.
Github Guide for additional information : GitHub Guide 101

PHASE 2 - END CHECKLIST
Architecture clear and documented
PRD complete
Tool-optimised starting prompt created
First build live with must-have flow in place
Backup on github



PHASE 3 - BACKEND, AUTOMATIONS, ITERATION & DEMO
Database implementation, CRUD, testing, and enhancement.
Step 9 - Database and CRUD
9.1 Data design
Primary entities (e.g. Tasks, Projects, Users):


__________________________


__________________________


For each, define:
Table / collection name: __________________________


Fields:
 _________________________________________________________


9.2 CRUD checklist
For each core entity, check if you support:
Entity
Create
Read / list
Update
Delete
Notes / gaps


☐
☐
☐
☐




☐
☐
☐
☐



If any box is unchecked:
Write a prompt to your tool / LLM:


 “Enable full CRUD for [entity] in my app.
 Add screens / actions for [missing operations].
 Keep UX consistent with existing screens.”




Step 10 - Automations and AI enhancements
This covers things like AI Task Breakdown, notifications, etc.
10.1 Backend & automations table
Trigger (event)
Tool / service
What should happen
User signs up / first login
e.g. n8n / built-in
Create user record, send welcome email, log to sheet
User creates a main item


Save item, optionally run AI Task Breakdown
User completes a workflow


Send summary email / notification / log to history

Fill this for your product:
Trigger (event)
Tool / service
What should happen



















10.2 Optional “wow” AI feature
Pick one small enhancement (example: AI Task Breakdown):
Feature name:
 _________________________________________________________


What it does in one line:
 _________________________________________________________


Prompt or config notes for it:
 _________________________________________________________



Step 11 - Testing and iteration loop
test → see missing edit/delete → prompt → fix → retest.
11.1 Scenario test script
Define one realistic scenario:
“User type [X] wants to [goal].
 They will go through: [screen 1] → [screen 2] → [screen 3] → done.”
Describe it:
_________________________________________________________
11.2 Bug and gap log
While testing, log issues:
#
What broke / missing (issue)
Where (screen / flow)
Prompt you used to fix it
Fixed? (Y/N)
1








2








3









Cycle:
Run the scenario end-to-end.
Write down each issue.
Use targeted prompts to the builder to fix.
Retest.


11.3 Stability checklist
Must-have flow works start to finish at least twice in a row
No obvious dead buttons or dead-end screens
CRUD works for main entities
Key automation(s) fire as expected



Step 12 - Demo and reflection
12.1 Demo script (3–5 mins)
Fill this and use it as your narration:
User and problem:
 “Our product is for ____________________ who struggle with ____________________.”


What you built:
 “In 3 days, we built ____________________ so they can ____________________.”


Live walkthrough:


Start from entry point.


Run the must-have flow end-to-end.


Show the one wow AI/automation detail.


Close:


“Next, we plan to ____________________.”


Demo checklist
Clear entry path (login or shared URL)
Must-have flow runs live without hidden setup
Wow feature works on demo data


12.2 Reflection after the hackathon
What users / judges liked most:
 _________________________________________________________


One product / design choice that worked well:
 _________________________________________________________


Top 3 issues you noticed:


__________________________


__________________________


__________________________


Next 7-day plan:


Improve stability and UX


Add 1–2 parked features


Test with 3–5 real users


Clean PRD and architecture for v2


Resources 
Pitch Deck Template : Accelerator Pitch Deck
Product Ideas : Product Ideas for Accelerator
Loom for recording : https://www.loom.com/


