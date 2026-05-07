# PROJECT SPECIFICATION
## Elysia Phase 2.5 — Productivity Presence & Attention Orchestration

---

# 1. PHASE OVERVIEW

Phase 2.5 finalizes Elysia’s behavioral identity before voice interaction is introduced.

This phase transforms Elysia from:
- a memory-enabled assistant shell

into:
- a calm productivity presence system

The primary objective is:
- intelligent timing
- focus support
- contextual continuity
- ambient interaction behavior

This phase is CRITICAL before Phase 3 voice integration.

---

# 2. CORE PHILOSOPHY

Elysia should:
- support deep work
- reduce cognitive overload
- remain calm and subtle
- avoid interruption fatigue
- feel observant, not invasive

The assistant must NEVER become:
- noisy
- hyperactive
- emotionally manipulative
- notification spam
- attention-seeking

---

# 3. PRIMARY PHASE GOALS

Implement:

1. Focus session system
2. Goal management system
3. Reminder orchestration
4. Attention scoring engine
5. Ambient presence behaviors
6. Contextual timing logic
7. Productivity identity refinement

---

# 4. FOCUS SESSION SYSTEM

## Purpose

Focus mode should become Elysia’s core identity.

This is NOT a simple Pomodoro timer.

It is:
- a contextual work-state system
- a productivity awareness layer
- a deep-work support mechanism

---

# 5. REQUIRED FOCUS FEATURES

## Session Lifecycle

Support:
- start session
- pause session
- resume session
- end session
- cancel session

---

## Session Metadata

Each session stores:
- title
- target objective
- duration
- tags
- notes
- completion status

Example:
{
  "title": "AOI Dashboard Refactor",
  "duration": 90,
  "tags": ["React", "FastAPI"],
  "status": "active"
}

---

## Session UI

Display:
- live timer
- objective
- session state
- elapsed time
- remaining time

---

## Focus States

### Focus Active
- darker UI
- calmer animations
- reduced notifications
- focused avatar glow

### Focus Paused
- dimmed focus indicator

### Focus Complete
- subtle completion animation

---

# 6. GOAL MANAGEMENT SYSTEM

Implement lightweight goal tracking.

---

## Goal Categories

### Daily Goals
- temporary
- resettable

### Long-Term Goals
- persistent
- project-oriented

---

## Required Goal Features

Support:
- create goal
- complete goal
- archive goal
- edit goal
- priority tagging

---

## Goal Examples

- Finish inference API
- Continue TempCastML backend
- Research AOI optimization
- Prepare thesis summary

---

# 7. REMINDER SYSTEM

Implement local reminder orchestration.

---

## Reminder Features

Support:
- time-based reminders
- session-based reminders
- recurring reminders
- silent reminders

---

## Notification Behavior

Notifications must:
- respect focus mode
- avoid spam
- remain minimal
- use calm language

---

## Example Notifications

GOOD:
- "Focus session completed."
- "Reminder: Continue inference optimization."

BAD:
- "HEY YOU ARE FALLING BEHIND"
- "YOU HAVE BEEN DISTRACTED"

---

# 8. ATTENTION ORCHESTRATION ENGINE

This is the MOST IMPORTANT SYSTEM in Phase 2.5.

---

# Purpose

Control:
- when Elysia should speak
- when Elysia should remain silent
- notification priority
- interruption timing

This system prevents:
- assistant fatigue
- annoying behavior
- spammy interactions

---

# 9. ATTENTION SCORING SYSTEM

Each event receives a priority score.

---

## Example Event Priorities

### HIGH
- session completed
- reminder overdue

### MEDIUM
- long inactivity during active goal

### LOW
- ambient suggestions

### IGNORE
- while user typing rapidly
- during fullscreen apps
- during intense focus periods

---

# 10. INTERRUPTION RULES

Elysia MUST NOT interrupt:
- active typing
- active focus sessions unless urgent
- fullscreen applications
- rapid interaction bursts

The assistant should prioritize silence.

---

# 11. AMBIENT PRESENCE SYSTEM

Expand subtle environmental behaviors.

---

## Required Behaviors

### Dynamic Status Text
Examples:
- "Focus session active"
- "Awaiting next objective"
- "Monitoring active goals"

### Idle Presence
- slow breathing animations
- subtle glow cycling
- reduced movement during long sessions

### Focus Presence
- calmer lighting
- reduced visual intensity
- mission-control aesthetic

---

# 12. CONTEXTUAL PRODUCTIVITY LAYER

Elysia should begin contextual awareness.

---

## Examples

If unfinished goals exist:
- gentle reminders possible

If user completes session:
- brief summary prompt possible

If long inactivity:
- optional check-in

---

# 13. SESSION SUMMARY SYSTEM

At session completion:
Generate:
- completed objectives
- session duration
- key notes
- unresolved tasks

Store locally.

---

# 14. MEMORY INTEGRATION RULES

Memory retrieval should prioritize:
- active goals
- current session
- unfinished tasks
- recent summaries

DO NOT inject irrelevant memories.

---

# 15. UI EXPANSIONS

Add:

## Focus Panel
- active timer
- session controls
- session objective

## Goals Panel
- active goals
- completed goals

## Reminder Panel
- upcoming reminders
- overdue reminders

## Attention Status
- current assistant mode
- notification suppression state

---

# 16. NEW ASSISTANT STATES

Add:
- focused
- paused
- notifying
- dormant
- summarizing

Transitions must remain smooth and subtle.

---

# 17. PERFORMANCE REQUIREMENTS

All systems must:
- remain lightweight
- avoid excessive rerenders
- minimize background CPU usage
- support low-resource systems

Attention engine must remain efficient.

---

# 18. ARCHITECTURE EXPANSION

Create modular systems:

services/
  focus/
  goals/
  reminders/
  attention/
  summaries/

---

# 19. PRIVACY REQUIREMENTS

Elysia must remain:
- local-first
- transparent
- user-controlled

DO NOT:
- monitor sensitive content
- inspect personal messages
- collect telemetry
- behave like surveillance software

---

# 20. BANNED FEATURES

DO NOT IMPLEMENT:
- autonomous AI actions
- emotional simulation
- relationship mechanics
- gamified addiction systems
- punishment UX
- productivity guilt systems
- excessive notifications

---

# 21. SUCCESS CRITERIA

Phase 2.5 succeeds when:

- focus sessions feel immersive
- reminders feel intelligent
- notifications are well-timed
- Elysia feels calm and observant
- assistant interruptions feel rare and meaningful
- goal continuity works naturally
- the assistant supports deep work effectively

---

# 22. ROLE OF THE AI CODING AGENT

The AI coding agent must act as:
- productivity systems engineer
- behavioral systems architect
- desktop UX engineer
- HCI-focused AI engineer

The agent must prioritize:
- timing
- subtlety
- restraint
- responsiveness
- clarity

---

# 23. FINAL DIRECTIVE

Build Elysia into:
- an ambient productivity companion
- a deep-work support system
- a calm contextual desktop presence

NOT:
- a hyperactive assistant
- a motivational spam machine
- a toy chatbot
- an AGI simulator

The assistant should feel:
- composed
- observant
- useful
- restrained
- intelligent through timing