# MindGame — MoSCoW Prioritization

**Project:** MindGame (Pre-Game Mental Routine Builder)
**Source:** Derived from MindGame_Interview_Summary.md and MindGame_User_Stories.md
**Personas:** Maya (College Athlete), Priya (Recreational Player), Coach Derrick (Amateur Coach)
**Framework:** MoSCoW — Must Have / Should Have / Could Have / Won't Have (this release)

> Prioritization is grounded in interview evidence, not assumption.
> Each decision includes the reasoning and the interview signal behind it.

---

## MoSCoW Summary Table

| Story ID | Title | Persona | MoSCoW | Rationale |
|---|---|---|---|---|
| US-01 | Onboarding: Sport & Anxiety Profile | Athlete | **Must Have** | Entry point to personalization — without it, every routine feels generic |
| US-02 | Routine Builder: Create Personal Routine | Athlete | **Must Have** | Core product loop — app has no value without this |
| US-03 | Guided Routine Execution | Athlete | **Must Have** | Athletes can't execute techniques without guidance; blank canvas fails |
| US-04 | Time-Tiered Routine Templates | Athlete | **Must Have** | Time is a non-negotiable constraint — routines over 5 min won't be used |
| US-05 | Pre-Game Entry Log | Athlete | **Must Have** | Required to power the feedback loop; no data = no dashboard |
| US-12 | Privacy: All Data Private by Default | All | **Must Have** | Stigma is real — athletes won't log honestly if data isn't private |
| US-06 | Post-Game Reflection Entry | Athlete | **Should Have** | Closes the feedback loop; without it correlation tracking is impossible |
| US-07 | Correlation Dashboard | Athlete | **Should Have** | The primary retention mechanism — Priya quit because she had no feedback |
| US-08 | Pre-Arrival Routine Reminder | All | **Should Have** | All three personas struggled mentally before arriving — timing matters |
| US-11 | Routine History & Entry Review | Athlete | **Should Have** | Supports the feedback loop; required for the dashboard to be meaningful |
| US-09 | Coach: Create & Share Template | Coach | **Could Have** | Derrick showed no commitment signal — validate athlete loop first |
| US-10 | Athlete: Customize Coach Template | Athlete | **Could Have** | Dependent on US-09; no value without the coach feature |
| — | Mid-Game Recovery Techniques | Athlete | **Won't Have** | Single source (Maya); extends scope beyond pre-game core proposition |
| — | Group / Team Ritual Feature | Coach | **Won't Have** | Failed in practice; contradicts the athlete ownership insight |
| — | Social / Community Features | All | **Won't Have** | Stigma data actively warns against this — could suppress adoption |

---

## Must Have

*The product does not function or deliver core value without these. Non-negotiable for MVP.*

---

### US-01 — Onboarding: Sport & Anxiety Profile Setup

**Why it's a Must Have:**
Both Maya and Priya independently said generic routines didn't work for them. Maya copied teammates' routines and abandoned them. Priya wanted something matched to her sport and anxiety patterns. Without onboarding, every user lands on a blank slate with no starting point — exactly the friction that caused both of them to give up in the past.

Onboarding is also the data-collection step that powers the rule-based recommender (US-01 feeds US-02 and US-07). Without it, personalization is impossible.

**Interview anchor:** Maya — *"It doesn't feel like mine."* Priya — *"Based on my sport and how I experience anxiety."*

**Scope for MVP:**
- 4-screen questionnaire: sport, competitive level, anxiety symptoms, available time
- Completes in under 2 minutes
- Outputs a suggested starter routine
- Skip option available — no forced gate

---

### US-02 — Routine Builder: Create a Personalized Routine

**Why it's a Must Have:**
This is the core product. MindGame without a routine builder is just an article about sports psychology. The builder is also the mechanism by which athletes take ownership of their routine — the single most important insight from all three interviews. Derrick's group ritual died because players didn't own it. Maya abandoned copied routines for the same reason.

Athlete authorship is not a feature preference — it is the causal mechanism behind adherence.

**Interview anchor:** Maya — *"It doesn't feel like mine."* Derrick — *"It was my thing, not theirs."*

**Scope for MVP:**
- Technique library: breathing, visualization, affirmations, focus cues, grounding
- Drag-and-drop step ordering
- Running time estimate as steps are added
- Save with custom name; up to 5 routines per profile

---

### US-03 — Guided Routine Execution

**Why it's a Must Have:**
Knowing a routine exists and being able to execute it are two different problems. Maya Googled visualization and gave up because she didn't know if she was doing it right. Priya wanted something that told her what to do. A routine builder without guided execution produces the same outcome as a blank journal — athletes stare at it and don't know what to do.

Guided execution is what separates MindGame from a note-taking app.

**Interview anchor:** Priya — *"Something that tells me what to do rather than me having to figure it out."* Maya — *"I gave up on visualization — I didn't know if I was doing it right."*

**Scope for MVP:**
- Full-screen step-by-step walkthrough
- Explicit instructions per technique (not just technique names)
- Progress indicator (steps remaining, time left)
- Pause and resume
- Completion screen → feeds into pre-game log (US-05)

---

### US-04 — Time-Tiered Routine Templates

**Why it's a Must Have:**
Time is not a preference — it is a hard constraint. Priya stated five minutes as a ceiling, not a target. Derrick's only successful team intervention was two minutes long. Maya's attempts at longer routines collapsed under their own weight. Any routine that exceeds the athlete's available time will be skipped entirely on game day.

Time tiers are also necessary for the recommender to work — matching a user who said "2 minutes available" to a 10-minute routine is a product failure.

**Interview anchor:** Priya — *"Five minutes max."* Derrick — *"Two-minute group ritual — that was the only thing that worked."*

**Scope for MVP:**
- Three tiers: Quick (≤2 min), Standard (3–5 min), Extended (6–10 min)
- Time displayed prominently on every routine card
- Default recommendation: Standard tier (or Quick if indicated in onboarding)
- Actual execution time must not exceed stated time by more than 30 seconds

---

### US-05 — Pre-Game Entry Log

**Why it's a Must Have:**
The pre-game log is the data layer that makes everything else meaningful. Without it, there is no correlation dashboard, no history, and no feedback loop. Priya's three-week experiment failed precisely because she tracked nothing and couldn't tell if it was working. The log is the minimum viable data collection step.

It also creates a micro-commitment ritual — completing the log after a routine reinforces the habit.

**Interview anchor:** Priya — *"I had no record of whether my routine weeks were better. That would've been useful."*

**Scope for MVP:**
- Prompted automatically after routine completion
- Captures: routine completed (yes/partial/no), anxiety level (1–5), confidence level (1–5)
- Optional 200-character notes field
- Timestamped and linked to game event
- Accessible from history view

---

### US-12 — Privacy: All Data Private by Default

**Why it's a Must Have:**
This is an architectural constraint, not a feature. All three interviews independently surfaced stigma around mental struggle in sport. Priya described being mocked as the one who "chokes." Maya noted that nobody on her team admits to mental struggles. Derrick observed that players avoid showing weakness in front of coaches.

If athletes believe their anxiety scores or performance reflections can be seen by a coach or teammates, they will not log honestly — or at all. Privacy is not a setting. It must be the default state of the entire data model.

**Interview anchor:** Priya — *"Priya's going to choke again."* Maya — *"Nobody wants to admit it. Everyone's pretending they're fine."*

**Scope for MVP:**
- All user data private and visible only to the athlete by default
- Coach visibility limited to: has an active routine saved (yes/no) — nothing else
- No public profiles, leaderboards, or social sharing of any kind
- Data deletion available: individual entries and full account, with confirmation step

---

## Should Have

*Significant value, strongly supported by evidence, but the MVP core loop functions without them. Build in the first release cycle post-MVP.*

---

### US-06 — Post-Game Reflection Entry

**Why it's a Should Have:**
Without post-game reflection, the pre-game log is a one-sided record with no outcome data. The correlation dashboard (US-07) cannot function without both pre-game and post-game entries linked together. Priya's core frustration — not knowing if the routine was working — is only resolvable if post-game performance is captured.

It is a Should Have rather than Must Have because the app can ship with pre-game logging alone, and athletes can begin building a data history. Post-game reflection can be added in the next cycle without breaking existing data.

**Interview anchor:** Priya — *"I wasn't sure if it was working."*

**Scope:**
- Prompted via push notification after game end time
- Captures: self-rated performance (1–5), mental state during game (1–5), optional one-word feeling
- Linked automatically to the pre-game entry from the same day
- Dismissible — no repeated reminders for the same game

---

### US-07 — Routine vs. Performance Correlation Dashboard

**Why it's a Should Have:**
This is the primary retention feature. The single most consistent theme across all three interviews was the absence of a feedback loop. Priya quit after three weeks because she couldn't see whether it was working. Without the dashboard, motivated athletes will eventually stop using the app for the same reason.

It is a Should Have rather than Must Have because the dashboard requires a minimum of 5 data points to be useful — athletes need to log first. Building the dashboard before there is data to show is premature.

**Interview anchor:** Priya — *"I wasn't sure if it was working. That would've been useful."*

**Scope:**
- Minimum 5 game entries required before patterns are shown (placeholder state below threshold)
- Chart comparing average self-rated performance: routine completed vs. not completed
- Streak display for consecutive routine completions
- Disclaimer: results are self-reported and not scientifically validated

---

### US-08 — Pre-Arrival Routine Reminder

**Why it's a Should Have:**
All three personas described their mental struggles beginning well before arriving at the venue. Maya spiraled on the bus. Priya felt tight before walking on court. Derrick explicitly said he wanted players to arrive already prepared. The timing of the routine matters — a routine completed at the venue during warm-up is less effective than one completed at home in a calm environment.

It is a Should Have because the app functions without push notifications, but adoption and habit formation will be meaningfully weaker without timely reminders.

**Interview anchor:** Derrick — *"I'd want them to arrive already prepared."*

**Scope:**
- Reminder options: 30, 45, or 60 minutes before game start
- Default: 45 minutes, framed as "before you leave home"
- Notification includes: routine name, estimated time, one-tap deep link into walkthrough
- Fully opt-out in notification settings

---

### US-11 — Routine History & Entry Review

**Why it's a Should Have:**
History is the foundation of the correlation dashboard. Without a browsable, filterable record of past entries, the dashboard has no depth and athletes cannot reflect on their own patterns over time. It also provides the data persistence guarantee that makes long-term use feel trustworthy.

It is a Should Have rather than Must Have because the app's immediate value (building and running a routine) does not depend on history being viewable. History becomes critical at the retention stage.

**Interview anchor:** Priya — *"I had no record of anything."*

**Scope:**
- Reverse chronological list of all entries: date, sport, routine completion, pre-game anxiety, post-game performance
- Tap to expand full entry detail including notes
- Filter by: routine completed, date range, sport
- Data persists across sessions and log-out/log-in cycles

---

## Could Have

*Valuable for a specific persona (coach), but dependent on validating the core athlete loop first. No commitment signal received from the coach persona in discovery interviews.*

---

### US-09 — Coach: Create and Share a Routine Template

**Why it's a Could Have:**
Coach Derrick is a real persona with a real problem — he wants to introduce mental prep to his players without designing individual routines for each one. However, Derrick gave no commitment signal during the interview. He did not ask for a follow-up, did not offer to try a prototype, and did not indicate he would pay or advocate for such a tool.

The coach feature also adds significant product complexity: a separate account type, a coach dashboard, team roster management, and a template sharing system. Building this before the core athlete loop is validated risks investing engineering effort in a persona who may not convert.

**Condition for promotion to Should Have:** Find at least one coach willing to use a prototype and share it with their team before building.

**Interview anchor:** Derrick — *"I don't have time to design something for each person."*

**Scope (when built):**
- Separate coach account type with distinct dashboard
- Template creation using the same technique library available to athletes
- Team roster management and template sharing via in-app notification
- Athletes must customize before running — cannot execute the coach's template directly
- Coach visibility strictly limited: active routine saved (yes/no) per athlete only

---

### US-10 — Athlete: Customize a Coach-Shared Template

**Why it's a Could Have:**
This story has no independent value — it only exists if US-09 is built. It is listed separately because the customization requirement is not optional: the core insight from both Maya and Derrick is that externally imposed routines die. If the coach template feature is built without mandatory athlete customization, it will reproduce the exact failure mode Derrick already experienced with his group ritual.

**Condition for promotion:** Same as US-09 — validate the coach acquisition channel before building.

**Interview anchor:** Maya — *"It doesn't feel like mine."* Derrick — *"It was my thing, not theirs."*

**Scope (when built):**
- Athlete receives notification with template preview (full steps, time estimate)
- Must tap Customize & Save to enter routine builder with template pre-loaded
- All edits saved as personal copy — coach's original template is never modified
- Dismiss option available — declined templates do not appear in routine list

---

## Won't Have (This Release)

*Explicitly excluded based on interview evidence. Not deferred — actively contraindicated by discovery data.*

---

### Mid-Game Recovery Techniques

**Why it's excluded:**
Only Maya mentioned the mid-game spiral problem, and she raised it as an aside rather than a primary frustration. It was not confirmed by Priya or Derrick. More importantly, mid-game recovery is a meaningfully different product scope from pre-game preparation — it requires different techniques, different UX (accessible under pressure in real-time), and a different usage context entirely.

Building this without further validation would extend scope before the core proposition is proven.

**Revisit condition:** Conduct 3+ additional interviews specifically exploring mid-game mental state. If the pattern is consistent and specific, scope it as a separate feature or a Phase 2 expansion.

---

### Group / Team Ritual Feature

**Why it's excluded:**
Derrick tried a group ritual for a month. It worked briefly and then died entirely when he stopped pushing it. His own analysis: players didn't own it. This is not a feature gap — it is evidence that group-imposed rituals are structurally less effective than individually owned ones. Building a group ritual feature would risk encoding the failure mode directly into the product.

The coach template sharing feature (US-09/US-10) addresses the coach's legitimate need — giving players a starting point — without creating group dependency or removing athlete ownership.

---

### Social / Community Features

**Why it's excluded:**
No persona requested social features. More significantly, all three interviews independently surfaced stigma as a meaningful barrier. Priya was publicly mocked for choking. Maya noted that nobody on her team admits to mental struggle. Derrick observed players hiding weakness from coaches.

Building social features into a product where the core use case involves vulnerability and shame is not a neutral choice — it is likely to actively suppress adoption and honest logging. Privacy-first is a competitive differentiator, not a limitation.

**This is a permanent exclusion for this product category, not a deferral.**

---

## Prioritization Rationale: Key Principles Applied

| Principle | How it shaped the MoSCoW decisions |
|---|---|
| Evidence over assumption | Every Must Have traces to 2+ independent interview signals |
| Commitment signals matter | Coach features demoted to Could Have due to zero commitment from Derrick |
| Failure modes are data | Group ritual and social features excluded because interview data shows why they fail |
| Dependency sequencing | US-10 cannot be built without US-09; dashboard cannot function without log data |
| Retention is not MVP | Feedback loop features (US-06, US-07) are Should Have — core loop ships first |
| Privacy is architecture | US-12 is Must Have because it affects how the entire data model must be designed |

---

## MVP Scope: Must Have Stories Only

If Raj and Vineela ship only the Must Have stories, athletes can:
1. Complete a short onboarding questionnaire and receive a matched routine suggestion
2. Build their own personalized pre-game routine from a technique library
3. Execute it step by step with guided instructions
4. Select a routine that fits within their available time
5. Log their pre-game mental state after completing the routine
6. Do all of the above with full confidence that their data is private

**What MVP does not yet deliver:** The feedback loop (correlation dashboard), the coach channel, and push notification reminders. These are real gaps — but they are retention and growth features. The MVP proves that the core habit loop works before investing in what sustains it.

---

*MoSCoW prioritization derived from MindGame_Interview_Summary.md and MindGame_User_Stories.md. All priority decisions are traceable to specific interview signals.*
