# MindGame — Customer Discovery Interview Summary
**Project:** MindGame (Pre-Game Mental Routine Builder)
**Method:** Mom Test interviews (pre-build discovery, no product pitched)
**Personas Interviewed:** Maya (College Athlete), Priya (Recreational Player), Coach Derrick (Amateur Coach)
**Goal:** Surface real, behavior-backed pain points to inform a meaningful feature set

---

## Interview Snapshot

| | Maya, 20 | Priya, 27 | Coach Derrick, 44 |
|---|---|---|---|
| **Persona** | College Soccer Player | Recreational Tennis Player | Amateur Soccer & Tennis Coach |
| **Core Pain** | Spirals after early mistakes; training vs. game gap | Consistent underperformance in matches vs. practice | Players mentally check out after errors; no tools to help |
| **Tried Something?** | Yes — playlist, breathing, Googled visualization | Yes — YouTube routine, 3 weeks of journaling | Yes — group breathing ritual for 1 month |
| **Why It Failed** | Not structured, didn't feel personal | No feedback loop; felt like homework | Players didn't own it; died when he stopped pushing |
| **Professional Access** | Gatekept — sports psych only for top varsity | None | None; most resources assume elite athletes |
| **Key Quote** | *"It doesn't feel like mine."* | *"I wasn't sure if it was working."* | *"I'd want them to arrive already prepared."* |

---

## Validated Pain Points
*Heard independently from 2 or more personas — high confidence.*

- **Practice-to-match performance gap** driven by mental state, not skill deficit
- **Inconsistent or nonexistent pre-game routine** — athletes know they need one but don't have one
- **Prior attempts that didn't stick** — lack of structure, feedback, or personalization killed adherence
- **No access to professional sports psychology** — gatekept by performance level or cost
- **Social stigma** around admitting mental struggle in sport — nobody wants to be the one who "chokes"

---

## Feature Set — Prioritized by Evidence

### Tier 1: Core Features (Strong signal, multiple sources)

#### 1. Personalized Routine Builder
- **Evidence:** Maya abandoned copied routines because they didn't feel personal. Derrick's team-assigned ritual died because players didn't own it.
- **Insight:** Routines must be athlete-authored, not coach-assigned or template-copied. Customization is the difference between adoption and abandonment.
- **Feature scope:** Guide athletes through building their own routine (visualization, breathing, affirmations) step by step, with sport and anxiety profile as inputs.

#### 2. Guided Steps with Low Cognitive Load
- **Evidence:** Priya explicitly said *"something that tells me what to do rather than me having to figure it out."* Maya gave up on visualization because she didn't know if she was doing it right.
- **Insight:** Blank-canvas journaling fails. Athletes need structured prompts, not open-ended fields.
- **Feature scope:** Step-by-step guided routine execution — not a blank form, but a walkthrough with instructions per technique (how to visualize, how to breathe, what to write).

#### 3. Post-Game Reflection + Correlation Tracking
- **Evidence:** Priya tried a routine for 3 weeks and stopped because she couldn't tell if it was working. She explicitly said *"that would've been useful"* when asked about tracking adherence vs. performance.
- **Insight:** Without a feedback loop, athletes can't build conviction that the routine matters — and they quit.
- **Feature scope:** Pre-game routine completion log + post-game performance/mood rating. Dashboard showing correlation between adherence and self-reported performance over time.

#### 4. Time-Constrained Routines (≤5 Minutes)
- **Evidence:** Priya's hard constraint — *"five minutes max."* Derrick's only successful intervention was a 2-minute group ritual. Maya's routine attempts failed partly due to effort required.
- **Insight:** Recreational and college athletes will not sustain long routines. Time is a non-negotiable design constraint, not a preference.
- **Feature scope:** Routine templates tiered by time (2 min / 5 min / 10 min). Default recommendation for new users: 5 minutes or less.

---

### Tier 2: Important Features (Single strong source or strong logical extension)

#### 5. Pre-Arrival Routine Framing
- **Evidence:** Derrick said *"I'd want them to arrive already prepared."* All three personas described their mental struggles beginning before they reached the venue.
- **Insight:** The routine should be designed to be completed at home or in transit — not during warm-up. Positioning matters for adoption.
- **Feature scope:** Onboarding framing and notification timing should anchor the routine to 30–60 minutes before the game, not on arrival.

#### 6. Coach Template Sharing with Athlete Customization
- **Evidence:** Derrick has no time to design individual routines but wants to introduce mental prep to his team. The group ritual failed because athletes didn't own it.
- **Insight:** Coaches need a *delegation* tool — suggest a starting point, let athletes personalize from there.
- **Feature scope:** Coach account can create and share a routine template with a team. Athletes receive it as a starting point and can customize before saving as their own.

#### 7. Rule-Based Routine Recommender (Sport + Anxiety Profile)
- **Evidence:** Priya wanted suggestions based on her sport and how she experiences anxiety. Maya tried to copy teammates' routines because she didn't know where to start.
- **Insight:** Athletes need a starting point that feels relevant — not a generic template.
- **Feature scope:** Short onboarding questionnaire (sport, typical anxiety symptoms, available time) feeds a rule-based recommender that suggests an initial routine. No AI required.

---

### Tier 3: Needs Further Validation (Raised by one persona, or failed in practice)

#### 8. Mid-Game Recovery Techniques
- **Evidence:** Maya described spiraling after an early mistake mid-game. Not confirmed by other personas.
- **Risk:** This extends scope beyond pre-game prep, which is the core proposition. Needs validation before building.
- **Recommendation:** Explore in future interviews before committing to scope.

#### 9. Group / Team Ritual Feature
- **Evidence:** Derrick's group breathing ritual had brief success. However, it failed in practice and he attributed failure to lack of athlete ownership.
- **Risk:** Team features add complexity and may contradict the core insight that routines need to be individually owned.
- **Recommendation:** Deprioritize. Coach template sharing (Feature 6) addresses the coach use case without introducing group dependency.

#### 10. Social / Community Features
- **Evidence:** Not requested by any persona. Stigma data from all three interviews suggests athletes may actively prefer privacy.
- **Risk:** Building social features into a product where the core problem involves shame and vulnerability could suppress adoption.
- **Recommendation:** Do not build. Consider privacy-first framing as a differentiator instead.

---

## Cross-Persona Patterns — Design Principles

| Pattern | Design Implication |
|---|---|
| Routines die when externally owned | Make athlete authorship and customization central, not optional |
| No feedback loop = no adherence | Correlation tracking is a retention feature, not a nice-to-have |
| Stigma is real and consistent | Avoid social/public features; lean into private, personal experience |
| Time is the #1 constraint | Every routine must have a time estimate; default to ≤5 min |
| Athletes know the problem, not the solution | Guide them — don't ask them to design their own protocol from scratch |
| Coach's job-to-be-done is offloading, not conducting | Coach features should delegate to athletes, not create coach workload |

---

## Open Questions for Next Round of Discovery

1. Would athletes actually complete a routine on the day of a game, or does novelty wear off? *(habit formation — needs longitudinal signal)*
2. What does "performance" mean to a recreational player well enough to self-report it? *(metric design question)*
3. Is the coach a viable acquisition channel, or just a sympathetic voice? *(no commitment signal from Derrick — needs follow-up)*
4. How do athletes currently track anything about their sport — do they use apps at all? *(existing behavior baseline)*

---

## Honest Caveat

All three interviews produced warm, engaged responses — but **no commitment signals**. No one asked for a follow-up, requested early access, or offered time/reputation/money. The pain is real and consistent. Willingness to act on it is still unproven. The next step is finding 1–2 people willing to use a rough prototype — not just agree the problem exists.

---

*Summary prepared from 3 simulated Mom Test discovery interviews for MindGame (Raj Laskar, Vineela Goli). Interviews conducted pre-build; no product was pitched.*
