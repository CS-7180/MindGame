# MindGame — User Stories & Acceptance Criteria

**Project:** MindGame (Pre-Game Mental Routine Builder)
**Source:** Derived from Mom Test customer discovery interviews (Maya, Priya, Coach Derrick)
**Personas:**
- **College Athlete** — Maya, 20, college soccer player
- **Recreational Player** — Priya, 27, weekend tennis league
- **Amateur Coach** — Coach Derrick, 44, rec soccer & tennis

> Stories are ordered by feature tier (Tier 1 → Tier 2) and evidence strength.
> Each story includes the originating interview insight to maintain traceability.

---

## US-01 — Onboarding: Sport & Anxiety Profile Setup

**Persona:** College Athlete, Recreational Player
**Feature Tier:** Tier 1 — Personalized Routine Builder
**Interview Insight:** Maya copied teammates' routines and they didn't stick. Priya wanted suggestions *"based on my sport and how I experience anxiety."*

**User Story:**
> As an athlete, I want to complete a short onboarding questionnaire about my sport and anxiety patterns, so that the app can suggest a starting routine that feels relevant to me.

### Acceptance Criteria

**AC-01.1 — Questionnaire fields**
- GIVEN I open the app for the first time
- WHEN I reach the onboarding screen
- THEN I am prompted to enter: (1) sport, (2) competitive level (recreational / college / semi-pro), (3) typical anxiety symptoms (e.g. overthinking, physical tension, loss of focus), and (4) available time before a game (2 / 5 / 10 minutes)

**AC-01.2 — Questionnaire length**
- GIVEN I am completing onboarding
- WHEN I go through the questionnaire
- THEN it completes in 4 or fewer screens and takes no longer than 2 minutes

**AC-01.3 — Routine recommendation output**
- GIVEN I have completed the questionnaire
- WHEN I reach the final onboarding screen
- THEN the app displays a suggested starter routine with: technique names, estimated total time, and a brief reason why each technique was matched to my profile

**AC-01.4 — Skip option**
- GIVEN I do not want to complete the questionnaire
- WHEN I see the onboarding screen
- THEN I can skip it and browse routine templates manually without losing access to any feature

---

## US-02 — Routine Builder: Create a Personalized Routine

**Persona:** College Athlete, Recreational Player
**Feature Tier:** Tier 1 — Personalized Routine Builder
**Interview Insight:** Maya said *"it doesn't feel like mine"* about copied routines. Derrick's assigned team ritual died because players didn't own it.

**User Story:**
> As an athlete, I want to build my own pre-game mental routine by selecting and ordering techniques, so that the routine feels personal and I'm more likely to stick with it.

### Acceptance Criteria

**AC-02.1 — Technique library**
- GIVEN I am in the routine builder
- WHEN I browse available techniques
- THEN I can see at least the following categories: breathing exercises, visualization, affirmations, focus cues, and physical grounding techniques

**AC-02.2 — Add and reorder steps**
- GIVEN I am building a routine
- WHEN I select techniques
- THEN I can add them as steps, reorder them via drag-and-drop, and remove any step I don't want

**AC-02.3 — Time estimate display**
- GIVEN I have added one or more steps to my routine
- WHEN I view the routine
- THEN the app displays a running total time estimate that updates as I add or remove steps

**AC-02.4 — Save routine**
- GIVEN I have built a routine with at least one step
- WHEN I tap Save
- THEN the routine is saved under my profile with the name I provide, and is accessible from my home screen

**AC-02.5 — Multiple routines**
- GIVEN I have already saved one routine
- WHEN I create a new one
- THEN it is saved separately and I can maintain up to 5 distinct routines (e.g. one per sport or situation)

---

## US-03 — Guided Routine Execution

**Persona:** College Athlete, Recreational Player
**Feature Tier:** Tier 1 — Guided Steps with Low Cognitive Load
**Interview Insight:** Priya said *"something that tells me what to do rather than me figuring it out."* Maya gave up on visualization because she didn't know if she was doing it correctly.

**User Story:**
> As an athlete, I want the app to walk me through my routine step by step with instructions, so that I can execute each technique correctly without prior knowledge.

### Acceptance Criteria

**AC-03.1 — Step-by-step walkthrough**
- GIVEN I start my pre-game routine
- WHEN I tap Begin Routine
- THEN the app presents one technique at a time, full-screen, with a title, brief instruction text (2–4 sentences), and a timer or prompt to move to the next step

**AC-03.2 — Technique instructions**
- GIVEN I am on a breathing or visualization step
- WHEN the step is displayed
- THEN the instructions tell me exactly what to do (e.g. "Inhale for 4 counts, hold for 4, exhale for 4") — not just the name of the technique

**AC-03.3 — Progress indicator**
- GIVEN I am mid-routine
- WHEN I look at the screen
- THEN I can see how many steps remain and the total time left in the routine

**AC-03.4 — Pause and resume**
- GIVEN I am interrupted mid-routine
- WHEN I leave the app or tap Pause
- THEN my progress is saved and I can resume from the same step when I return

**AC-03.5 — Completion confirmation**
- GIVEN I complete the final step
- WHEN the routine ends
- THEN the app shows a completion screen and prompts me to log the pre-game entry (feeds into US-05)

---

## US-04 — Time-Tiered Routine Templates

**Persona:** Recreational Player, College Athlete, Amateur Coach
**Feature Tier:** Tier 1 — Time-Constrained Routines
**Interview Insight:** Priya's hard constraint was *"five minutes max."* Derrick's only successful intervention was a 2-minute group ritual. Time is the #1 adoption barrier.

**User Story:**
> As an athlete with limited time before a game, I want to choose a routine that fits my available time, so that I can complete it without feeling rushed or skipping steps.

### Acceptance Criteria

**AC-04.1 — Time tiers**
- GIVEN I am browsing routine templates
- WHEN I view the template library
- THEN templates are visibly labeled and filterable by time tier: Quick (≤2 min), Standard (3–5 min), and Extended (6–10 min)

**AC-04.2 — Default recommendation**
- GIVEN I am a new user who has not set a time preference
- WHEN the app suggests a starting routine
- THEN the default recommendation is from the Standard tier (3–5 min) or Quick tier if I indicated limited time in onboarding

**AC-04.3 — Time display on routine card**
- GIVEN I am viewing any routine — template or custom
- WHEN I see the routine card
- THEN the estimated completion time is displayed prominently before I start it

**AC-04.4 — No routine exceeds stated time by more than 30 seconds**
- GIVEN I select a routine labeled as 5 minutes
- WHEN I execute it at a normal pace following the prompts
- THEN the actual completion time does not exceed 5 minutes 30 seconds

---

## US-05 — Pre-Game Entry Log

**Persona:** Recreational Player, College Athlete
**Feature Tier:** Tier 1 — Post-Game Reflection + Correlation Tracking
**Interview Insight:** Priya had no record of whether her routine weeks were better than her non-routine weeks. She said *"that would've been useful"* in retrospect.

**User Story:**
> As an athlete, I want to log my pre-game mental state and whether I completed my routine, so that I have a record I can look back on.

### Acceptance Criteria

**AC-05.1 — Pre-game log prompt**
- GIVEN I have just completed a routine (or skipped it)
- WHEN the routine ends or I manually open the log
- THEN I am prompted to record: (1) did I complete my routine (yes / partial / no), (2) pre-game anxiety level (1–5 scale), and (3) pre-game confidence level (1–5 scale)

**AC-05.2 — Optional notes field**
- GIVEN I am completing a pre-game log
- WHEN I reach the notes section
- THEN there is an optional free-text field (max 200 characters) for anything I want to add — it is not required to save the entry

**AC-05.3 — Log saved to profile**
- GIVEN I complete a pre-game log entry
- WHEN I tap Save
- THEN the entry is saved with a timestamp and linked to that day's game event

**AC-05.4 — Log accessible from history**
- GIVEN I have saved at least one pre-game entry
- WHEN I navigate to my history
- THEN I can see all past entries in reverse chronological order

---

## US-06 — Post-Game Reflection Entry

**Persona:** Recreational Player, College Athlete
**Feature Tier:** Tier 1 — Post-Game Reflection + Correlation Tracking
**Interview Insight:** Priya stopped her routine because she couldn't tell if it was working. The feedback loop is what drives long-term adherence.

**User Story:**
> As an athlete, I want to log how I performed and felt after a game, so that I can later see whether my pre-game routine made a difference.

### Acceptance Criteria

**AC-06.1 — Post-game log prompt**
- GIVEN a game event has been logged for today
- WHEN I open the app after the game (or manually navigate to reflection)
- THEN I am prompted to complete a post-game reflection with: (1) self-rated performance (1–5), (2) mental state during the game (1–5), and (3) one optional word or phrase describing how I felt

**AC-06.2 — Prompt timing**
- GIVEN I have a game scheduled today
- WHEN the game's end time passes
- THEN the app sends a push notification prompting me to complete my post-game reflection (notification can be disabled in settings)

**AC-06.3 — Linkage to pre-game entry**
- GIVEN I complete a post-game reflection
- WHEN it is saved
- THEN it is automatically linked to the pre-game entry from the same day so both can be viewed together

**AC-06.4 — No reflection required**
- GIVEN I do not want to complete a post-game reflection
- WHEN I dismiss the prompt
- THEN no entry is created and I am not shown repeated reminders for that game

---

## US-07 — Routine vs. Performance Correlation Dashboard

**Persona:** Recreational Player
**Feature Tier:** Tier 1 — Post-Game Reflection + Correlation Tracking
**Interview Insight:** Priya's core frustration: *"I wasn't sure if it was working."* A visual feedback loop is the single feature most likely to prevent abandonment.

**User Story:**
> As an athlete, I want to see a visual summary of how my routine adherence relates to my performance over time, so that I can judge for myself whether the routine is worth keeping.

### Acceptance Criteria

**AC-07.1 — Minimum data threshold**
- GIVEN I have logged fewer than 5 game entries
- WHEN I open the dashboard
- THEN the app shows a placeholder explaining how many more entries are needed before patterns can be shown (no empty charts)

**AC-07.2 — Adherence vs. performance chart**
- GIVEN I have logged 5 or more game entries
- WHEN I open the dashboard
- THEN I see a chart or summary comparing: average self-rated performance on days I completed my routine vs. days I did not

**AC-07.3 — Streak display**
- GIVEN I have completed my routine on consecutive game days
- WHEN I view the dashboard
- THEN my current streak (consecutive routine completions) is displayed

**AC-07.4 — No false precision**
- GIVEN the correlation data is based on self-reported ratings
- WHEN the dashboard displays any comparison
- THEN the app includes a one-line disclaimer that results are self-reported and not scientifically validated

---

## US-08 — Pre-Arrival Routine Reminder

**Persona:** All three personas
**Feature Tier:** Tier 2 — Pre-Arrival Routine Framing
**Interview Insight:** Derrick said *"I'd want them to arrive already prepared."* All three personas described their mental struggles beginning well before they reached the venue — at home, on the bus, in the car.

**User Story:**
> As an athlete, I want to receive a reminder to start my routine before I leave for my game, so that I'm mentally prepared before I arrive — not scrambling to do it at the venue.

### Acceptance Criteria

**AC-08.1 — Reminder scheduling**
- GIVEN I have a game added to my schedule
- WHEN I set my pre-game reminder preference
- THEN I can choose to be reminded 30, 45, or 60 minutes before the game start time

**AC-08.2 — Notification content**
- GIVEN a reminder is triggered
- WHEN the push notification appears
- THEN it includes: my routine name, estimated completion time, and a one-tap deep link that opens directly into the routine walkthrough

**AC-08.3 — Reminder default framing**
- GIVEN I am a new user setting up my first game
- WHEN the app suggests a reminder time
- THEN the default is 45 minutes before game start, with a label explaining this is designed to be done before leaving home

**AC-08.4 — Reminder opt-out**
- GIVEN I do not want reminders
- WHEN I go to notification settings
- THEN I can disable all routine reminders without affecting other app functionality

---

## US-09 — Coach: Create and Share a Routine Template

**Persona:** Amateur Coach
**Feature Tier:** Tier 2 — Coach Template Sharing with Athlete Customization
**Interview Insight:** Derrick said *"I don't have time to design something for each person"* but wants to give his players a starting point. His group ritual failed because athletes didn't own it — so templates must be customizable by the athlete, not locked.

**User Story:**
> As a coach, I want to create a routine template and share it with my team, so that my players have a starting point for mental prep without me needing to guide each one individually.

### Acceptance Criteria

**AC-09.1 — Coach account type**
- GIVEN I sign up as a coach
- WHEN I complete registration
- THEN I have access to a coach dashboard that is distinct from the athlete view, with options to create templates and manage a team roster

**AC-09.2 — Template creation**
- GIVEN I am in the coach dashboard
- WHEN I create a routine template
- THEN I can select techniques from the same library available to athletes, set a recommended time tier, and add an optional note to my team (e.g. "Try this before Sunday's game")

**AC-09.3 — Team sharing**
- GIVEN I have created a template
- WHEN I share it with my team
- THEN all athletes on my roster receive an in-app notification with the template name, my note, and a prompt to preview and save it

**AC-09.4 — Athlete customization is mandatory, not optional**
- GIVEN an athlete receives a shared template
- WHEN they open it
- THEN they must save it as their own copy before they can use it — they cannot run the coach's template directly, ensuring they engage with and own the routine

**AC-09.5 — Coach cannot see athlete logs**
- GIVEN I am a coach
- WHEN I view my team roster
- THEN I can only see which athletes have saved and activated a routine — I cannot see their pre-game anxiety scores, performance ratings, or reflection notes

---

## US-10 — Athlete: Customize a Coach-Shared Template

**Persona:** College Athlete, Recreational Player (receiving a coach template)
**Feature Tier:** Tier 2 — Coach Template Sharing with Athlete Customization
**Interview Insight:** Maya and Derrick's data converge on the same insight: ownership is what makes routines stick. A template is a starting point, not a prescription.

**User Story:**
> As an athlete who has received a routine template from my coach, I want to customize it before I use it, so that the routine feels like mine and not something imposed on me.

### Acceptance Criteria

**AC-10.1 — Template preview before saving**
- GIVEN I have received a coach template
- WHEN I open the notification
- THEN I see a preview of the full routine (all steps, techniques, time estimate) before I am asked to do anything with it

**AC-10.2 — Edit before saving**
- GIVEN I am previewing a coach template
- WHEN I tap Customize & Save
- THEN I enter the routine builder with the template pre-loaded, and I can add, remove, or reorder any steps before saving

**AC-10.3 — Saved as personal copy**
- GIVEN I save a customized version of the coach template
- WHEN it appears in my routine list
- THEN it is labeled as my own routine (not as the coach's), and any future changes I make do not affect the coach's original template

**AC-10.4 — Decline option**
- GIVEN I receive a coach template I don't want
- WHEN I open the notification
- THEN I can dismiss it without saving — it does not appear in my routine list or clutter my home screen

---

## US-11 — Routine History & Entry Review

**Persona:** College Athlete, Recreational Player
**Feature Tier:** Tier 1 — Correlation Tracking (supporting feature)
**Interview Insight:** Priya had no record of anything. The entire value of the feedback loop depends on a reliable, browsable history.

**User Story:**
> As an athlete, I want to review my past game entries in one place, so that I can see my history of routine completions and game reflections over time.

### Acceptance Criteria

**AC-11.1 — History view**
- GIVEN I have logged at least one game entry
- WHEN I navigate to History
- THEN I see a list of all past entries in reverse chronological order, each showing: date, sport, routine completed (yes/partial/no), pre-game anxiety score, and post-game performance score

**AC-11.2 — Entry detail view**
- GIVEN I tap on a past entry
- WHEN the detail screen opens
- THEN I can see the full pre-game log and post-game reflection for that day, including any optional notes I wrote

**AC-11.3 — Filter by outcome**
- GIVEN I am in the History view
- WHEN I apply a filter
- THEN I can filter entries by: routine completed (yes/partial/no), date range, or sport — and the list updates accordingly

**AC-11.4 — Data persistence**
- GIVEN I log out and log back in
- WHEN I open History
- THEN all previously saved entries are still present and unchanged

---

## US-12 — Privacy: All Data Private by Default

**Persona:** All three personas
**Feature Tier:** Cross-cutting concern (not a feature tier — a design principle)
**Interview Insight:** All three interviews surfaced stigma around admitting mental struggle. Priya laughed off "Priya's going to choke again." Nobody will use this app if they think others can see their anxiety scores.

**User Story:**
> As an athlete, I want my mental prep data to be completely private by default, so that I can log honestly without worrying that my coach, teammates, or anyone else can see it.

### Acceptance Criteria

**AC-12.1 — Private by default**
- GIVEN I create an account
- WHEN my account is set up
- THEN all my data (anxiety scores, performance ratings, reflections, routine logs) is private and visible only to me — no sharing is enabled by default

**AC-12.2 — Coach data access is limited**
- GIVEN I am on a coach's team roster
- WHEN the coach views their team
- THEN the coach can only see whether I have an active routine saved — they cannot see any logged scores, ratings, or notes

**AC-12.3 — No public profiles**
- GIVEN I am using the app
- WHEN I look for a way to share or publish my stats
- THEN no such option exists — there are no public profiles, leaderboards, or social sharing features

**AC-12.4 — Data deletion**
- GIVEN I want to delete my data
- WHEN I navigate to account settings
- THEN I can delete individual entries or my entire account, and deletion is permanent and irreversible with a confirmation step

---

## Story Map Summary

| Story ID | Title | Persona | Feature Tier | Priority |
|---|---|---|---|---|
| US-01 | Onboarding: Sport & Anxiety Profile | Athlete | Tier 1 | P0 |
| US-02 | Routine Builder: Create Personal Routine | Athlete | Tier 1 | P0 |
| US-03 | Guided Routine Execution | Athlete | Tier 1 | P0 |
| US-04 | Time-Tiered Routine Templates | Athlete | Tier 1 | P0 |
| US-05 | Pre-Game Entry Log | Athlete | Tier 1 | P0 |
| US-06 | Post-Game Reflection Entry | Athlete | Tier 1 | P1 |
| US-07 | Correlation Dashboard | Athlete | Tier 1 | P1 |
| US-08 | Pre-Arrival Routine Reminder | All | Tier 2 | P1 |
| US-09 | Coach: Create & Share Template | Coach | Tier 2 | P2 |
| US-10 | Athlete: Customize Coach Template | Athlete | Tier 2 | P2 |
| US-11 | Routine History & Entry Review | Athlete | Tier 1 | P1 |
| US-12 | Privacy: All Data Private by Default | All | Cross-cutting | P0 |

**Priority Key:**
- **P0** — Must be in MVP. App does not work without it.
- **P1** — Required for retention. Build in first release cycle after MVP.
- **P2** — Coach-facing features. Build once core athlete loop is validated.

---

*User stories derived from MindGame_Interview_Summary.md. Each story is traceable to a specific interview insight. Acceptance criteria written in Given/When/Then format.*
