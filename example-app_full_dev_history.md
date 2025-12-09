Sample Filled Workbook
Example Idea: Travel Itinerary Planner

PHASE 1 - IDEATION (Example)
Step 1 - Product and user basics
1.1 Product one-liner
Product name:
 TripThreads


One-liner:
 For busy young professionals, TripThreads is a simple travel planner so they can organize day-wise itineraries in one place without messy spreadsheets and notes.


1.2 Who is this for
Primary user role:
 25-35 year old working professional who travels 1-3 times a year.


Context:
 Plans short trips (3-7 days) with friends or partner, usually on weekends or holidays, using multiple apps and random links.


Top 3 pains today:


Plans scattered across WhatsApp, screenshots, Notes, Maps.


Hard to see a clear day-wise plan and time clashes.


Last minute confusion on bookings, timings, and what is confirmed.


1.3 MVP success for this hackathon
By the end of 3 days:
A user should be able to:
 Create a trip, add day-wise activities with time and location, and view the full itinerary in one simple timeline.


Simple success metric:
 User completes one 3-day trip plan with at least 3 activities per day, without getting stuck.



Step 2 - Deepen the problem with 5 Whys
2.1 Problem statement v0
People planning trips struggle to keep their itinerary organized.
2.2 5 Whys table (filled)
Why #
Question
Answer
1
Why is this a problem for your user?
They feel stressed and confused before and during the trip.
2
Why does that happen right now?
Information is split across chats, screenshots, booking emails, and random notes.
3
Why haven’t existing tools solved this well?
Most tools are either too complex or focused on bookings, not on simple day-wise plans.
4
Why is your user still stuck?
Setting up existing trip planners feels heavy, so they fall back to WhatsApp and Notes.
5
Why does solving this now matter for them?
They want stress-free trips and to feel in control without spending hours planning.

2.3 Final problem statement
Busy young professionals feel stressed before trips because their plans are scattered across multiple apps, and existing tools are too heavy for quick, simple day-wise itineraries.

Step 3 - Competitor scan and AI feature analysis
3.1 Reference products
Product / tool
Links / pages checked
What they do well
What frustrates users
Google Travel
Search + “Trips” itinerary pages
Auto imports bookings, shows map and day split
Not easy to manually plan custom day blocks
TripIt
Itinerary from email confirmations
Auto-parses emails, central trip timeline
Focused on bookings, less on custom activities
Notion templates
Free trip planning templates
Flexible, can add anything
Too manual, takes effort to set up and maintain

3.2 AI feature extraction (summary)
Example AI feature table output (compressed):
Feature
What it does
Why users care
Tools
Trip overview
Shows trip dates and destination
Quick snapshot of the whole trip
All
Day-wise schedule
Activities listed per day
Helps avoid clashes and confusion
All
Booking details
Stores flights, hotels, references
One place to check confirmations
All
Map view
Activities on a map
Understand distance between plans
Some
Email import
Reads booking emails
Saves manual typing
TripIt

Key pattern:
Every tool has trip overview and day-wise schedule.


Differentiators: email import, deep map integration.


For MVP, focus on clean day-wise planning, not automation.



Step 4 - MVP scope with MoSCoW
4.1 Feature dump
Raw ideas:
Create trip with title, location, dates.


Add days automatically between start and end dates.


Add activities with time, title, notes, and basic location text.


Simple day-wise list view.


Edit and delete activities.


Mark activities as “must do” or “optional”.


Basic AI: suggest 3 activities per day based on city and theme.


Share read-only link of itinerary.


Export to PDF.


Map view with pins.


Attach booking references (PNR, hotel confirmation).


4.2 MoSCoW table (filled)
Feature
M
S
C
W
Differentiator?
Why here
Create trip (title, destination, dates)
☑
☐
☐
☐
-
Without trip object, nothing else makes sense.
Auto-generate days between start/end dates
☑
☐
☐
☐
-
Core to “itinerary” experience.
Add activities (time, title, notes)
☑
☐
☐
☐
-
Heart of the planner.
View schedule day-wise
☑
☐
☐
☐
-
Users need a clear daily plan.
Edit/delete activities
☑
☐
☐
☐
-
Basic CRUD, otherwise app frustrates users.
Mark activities as must-do / optional
☐
☑
☐
☐
-
Nice clarity, but not core.
AI suggestion: 3 activities per day
☐
☑
☐
☐
⭐
Differentiator, but secondary to base planner.
Share read-only link
☐
☑
☐
☐
-
People travel with others, sharing is important.
Export to PDF
☐
☐
☑
☐
-
Nice to have for offline use.
Map view
☐
☐
☑
☐
-
Useful, but not needed for first demo.
Attach booking references
☐
☐
☑
☐
-
Useful, can come after base flow.
Email import (auto from inbox)
☐
☐
☐
☑
-
Heavy build, not needed for hackathon MVP.

4.3 Final MVP scope for the hackathon
Must-have flow:
 User creates a trip, days auto-generate, user adds and edits activities per day, and sees a clean day-wise itinerary.


Should-haves (max 2):


Mark activities as must-do or optional.


AI suggestion that proposes 3 activities per day for a given city and theme.


Parked features:


Export to PDF.


Map view.


Attach booking references.


Email import.



PHASE 2 - BUILDING (Example)
Step 5 - Architecture: screens, flows, data, backend
5.1 Big picture architecture
Front-end:


Trip list screen.


Trip detail screen (day-wise view).


Activity editor modal or page.


Back-end / automations:


API to create/read/update/delete trips and activities.


AI endpoint to generate activity suggestions.


Data store:


Supabase with tables: users, trips, days, activities.


External services:


OpenAI API for activity suggestions.


5.2 Screens & actions table
Screen name
Who uses it
Key actions
Data shown
Trip List
Logged-in user
Create new trip, open existing trip
Trip title, destination, dates
Trip Detail
Logged-in user
View days, add activity, edit, delete
Days with activities
Activity Editor
Logged-in user
Add/edit time, title, notes, must/optional flag
Activity fields for one day
AI Suggestions UI
Logged-in user
Ask AI for suggestions, accept into itinerary
Suggested activities list


Step 6 - PRD with AI (example output summary)
Goal:
 Help busy professionals create and manage simple day-wise itineraries for trips in under 10 minutes.
Users:
 Primary: 25-35 year old working professionals, planning 3-7 day trips.
Scope (M + selected S):
Create and manage trips with destination and dates.


Auto-generate days for each trip.


Add, edit, and delete activities per day.


Mark activities as must-do or optional.


View full itinerary in a clean day-wise layout.


AI suggests 3 activities per day for a city and theme.


Share read-only link of itinerary.


Out of scope (for hackathon):
Map view with pins.


Email import.


Complex collaboration.


Core flows:
Create trip → auto days → add activities.


Edit activity.


Delete activity.


AI suggest → pick items → add to day.


Data model (main entities):
Trip: id, user_id, title, destination, start_date, end_date.


Day: id, trip_id, date, index.


Activity: id, day_id, start_time, title, notes, priority, created_at.


(For the learner, the PRD comes from the actual LLM, this is just a sample.)

Step 7 - Platform optimisation: starting prompt for Bolt
Chosen tool: Bolt + Supabase + OpenAI.
Sample starting prompt (ready to paste into Bolt)
Build a responsive web app called “TripThreads” for planning travel itineraries.
 Users sign in and manage trips.
 A Trip has: title, destination (city name), start_date, end_date.
 When a new trip is created, auto-generate Day records for each date between start_date and end_date.
Screens:
Trip List: show all trips for the logged-in user in cards with title, destination, dates, and a button to open trip.


Trip Detail: show the trip summary on top, and then a column for each day in order. Inside each day, show a list of activities.


Activity Editor: modal or panel to add/edit an activity with fields: start_time (HH:MM), title, notes, priority (must-do or optional).


A Day has: id, trip_id, date, index.
 An Activity has: id, day_id, start_time, title, notes, priority.
Core flows:
Create trip → auto-generate days.


Add/edit/delete activities under each day.


Mark priority as “must-do” or “optional”.


Add an “Ask AI for ideas” button in Trip Detail.
 When clicked, open a panel where the user enters: city, trip theme (e.g. food, culture, adventure), and day index.
 Call OpenAI API and return 3 suggested activities with title and short description.
 Let the user select suggestions to add directly as new activities on that day.
Use Supabase for auth and database.
 Focus on a clean, simple layout.

Step 8 - Day 1 & Day 2 execution (example outcome)
End of Day 1 (for learner):
Ideation completed.


Architecture sketched.


PRD created in a doc.


Starting prompt for Bolt ready.


End of Day 2 (for learner):
Bolt project created.


Supabase tables set up.


Trip List and Trip Detail screens working.


Can create a trip, see days, and manually add/edit/delete activities.



PHASE 3 - BACKEND, AUTOMATIONS, DEMO (Example)
Step 9 - Database and CRUD
Primary entities:
trips


id


user_id


title


destination


start_date


end_date


days


id


trip_id


date


index


activities


id


day_id


start_time


title


notes


priority


CRUD coverage
Entity
Create
Read
Update
Delete
Notes
trips
☑
☑
☑
☑
Done via Trip List and editor
days
☑
☑
☐
☐
Auto-create, no edit needed now
activities
☑
☑
☑
☑
Edit/delete from Trip Detail

Gap identified:
No need to edit days in MVP, so left as is.



Step 10 - Automations and AI enhancements
Backend & automations
Trigger (event)
Tool / service
What should happen
New trip created
Bolt + DB
Insert trip, auto-generate days between start and end dates
“Ask AI for ideas” button clicked
OpenAI
Send city, theme, and day index, get 3 suggestions, show to user
User confirms selected suggestions
Bolt + DB
Insert each chosen suggestion as a new activity for that day

Wow AI feature (example)
Name: AI Day Planner


What it does: Suggests 3 activities tailored to city and theme for a chosen day.


Prompt idea:


 “Suggest 3 short, practical activities in [city] for a [theme] trip. Each suggestion must fit into a half-day and be easy for young professionals. Return as JSON: title, short_description.”




Step 11 - Testing and iteration loop
Scenario test
A user is planning a 4-day trip to Goa with a “chill and food” theme. They should be able to create the trip, see 4 days generated, manually add breakfast and beach slots, and then ask AI for ideas for Day 2 and add them.
Bug/gap log (sample)
#
Issue
Where
Prompt used to fix
Fixed?
1
Activities not sorted by time
Trip Detail
“Sort activities in each day column by start_time ascending.”
Y
2
Priority tag not visible in list
Trip Detail
“Show priority as a colored label next to title.”
Y
3
AI suggestions panel closes on error
AI Suggestions UI
“Handle errors gracefully and show error message instead.”
Y

Stability checklist
Must-have flow works twice in a row without breaking.


Activities save correctly.


AI suggestions add activities correctly or fail gracefully.



Step 12 - Demo and reflection
Demo script
User and problem:
 “TripThreads is for busy young professionals who feel stressed planning trips because their plans are scattered across chats and notes.”


What was built:
 “Built a simple web app where you can create a trip, generate days automatically, and plan a clean day-wise itinerary.”


Live walkthrough:


Show trip creation for “Goa, 4 days”.


Show days generated.


Add a few manual activities.


Hit “Ask AI for ideas” for Day 2, add suggestions to the itinerary.


Scroll the full plan.


Close:
 “Next step is to add map view and better sharing, but even today you can plan a full trip in under 10 minutes.”


Reflection (example)
What worked:


Users liked the clean day-wise view and AI ideas button.


Issues:


Some confusion on how to edit trip dates.


Next 7-day plan:


Add map view and simple sharing link.


Improve onboarding copy for first-time users.


