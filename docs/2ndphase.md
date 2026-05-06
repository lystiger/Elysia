# PROJECT SPECIFICATION
## Elysia Phase 2 — Presence, Memory & Productivity Layer

---

# 1. PHASE OVERVIEW

Phase 2 transforms Elysia from a reactive AI shell into a persistent productivity companion.

The objective is NOT to create an autonomous AGI.

The objective IS to create:
- continuity
- contextual awareness
- lightweight productivity support
- emotional presence through consistency

Elysia should begin feeling like:
- a calm desktop operator
- a focus companion
- a personal mission control assistant

---

# 2. PRIMARY PHASE GOALS

This phase introduces:

1. Persistent lightweight memory
2. Productivity/task systems
3. Focus session support
4. Assistant continuity
5. Ambient desktop presence
6. Local notifications
7. Session summarization

This phase DOES NOT introduce:
- full voice system
- autonomous agents
- internet browsing
- tool execution
- emotional simulation
- self-planning AI

---

# 3. PHASE PHILOSOPHY

Elysia must remain:
- subtle
- calm
- useful
- non-intrusive
- ambient

Avoid:
- excessive notifications
- overactive behaviors
- fake emotions
- “anime mascot” behavior
- noisy UX

The assistant should feel:
- composed
- intelligent
- observant
- supportive

---

# 4. NEW CORE SYSTEMS

## 4.1 Persistent Memory Layer

Implement lightweight memory persistence.

Use:
- JSON storage
- local filesystem only

NO vector database yet.

---

## Required Memory Categories

### User Context
Store:
- preferred assistant tone
- active projects
- current goals
- focus preferences

### Session Context
Store:
- recent conversations
- recent tasks
- current work session

### Productivity Context
Store:
- active coding goals
- pending reminders
- focus streaks
- completed sessions

---

## File Structure

data/
  memory/
    profile.json
    session.json
    goals.json
    reminders.json
    summaries/

---

# 5. SESSION SUMMARIZATION SYSTEM

At session end or every X messages:

Generate:
- lightweight summaries
- key topics
- active goals
- unfinished tasks

Store summaries locally.

DO NOT store full conversation history forever.

The goal is:
- continuity
- retrieval efficiency
- lightweight persistence

---

# 6. PRODUCTIVITY SYSTEM

Implement:
- focus sessions
- lightweight task tracking
- reminders
- coding goals

---

## Focus Session Features

### Required
- Start focus session
- Pause session
- End session
- Session duration timer
- Session notes

### Optional
- Focus streak tracking
- Daily summary

---

## Example User Flows

"Start focus session for TempCastML backend"

"Remind me to finish inference pipeline tonight"

"Today's priorities"

---

# 7. LOCAL NOTIFICATION SYSTEM

Implement:
- desktop notifications
- reminder popups
- session completion alerts

Notifications must:
- be minimal
- avoid spam
- respect focus state

---

# 8. ASSISTANT CONTINUITY

Elysia should remember:
- active projects
- recent goals
- unfinished work

Examples:
- "You planned to continue the AOI dashboard today."
- "You paused a focus session 2 hours ago."

This creates perceived continuity.

---

# 9. AMBIENT PRESENCE SYSTEM

Implement subtle ambient behaviors.

Examples:
- idle status text rotation
- subtle avatar breathing changes
- focus mode visual shifts
- thinking shimmer while processing

DO NOT create noisy animations.

---

# 10. UI ADDITIONS

## Required Panels

### Session Panel
- current focus session
- timer
- session state

### Goal Panel
- active goals
- completed goals

### Reminder Panel
- upcoming reminders

### Memory Status
- lightweight memory indicators

---

# 11. STATE EXPANSION

Expand assistant states.

## Existing
- idle
- listening
- thinking
- responding
- error

## New
- focused
- notifying
- summarizing
- remembering

---

# 12. MEMORY RETRIEVAL SYSTEM

Implement simple contextual retrieval.

When generating prompts:
- retrieve recent summaries
- retrieve active goals
- retrieve current session state

Inject only relevant memory.

DO NOT dump entire memory files into prompts.

---

# 13. ARCHITECTURE REQUIREMENTS

Create modular services:

services/
  memory/
  productivity/
  notifications/
  summarization/

---

# 14. SUGGESTED TECHNOLOGIES

## Existing Stack
- Electron
- React
- TypeScript
- Tailwind
- Zustand

## Additional Libraries

### Notifications
- electron-notifications (or native Electron notifications)

### Persistence
- lowdb OR filesystem JSON

### Date/Time
- dayjs

### Optional
- react-hot-toast

---

# 15. BANNED FEATURES

DO NOT IMPLEMENT:
- cloud sync
- online accounts
- autonomous internet browsing
- GPT cloud APIs
- multi-agent orchestration
- browser automation
- self-modifying prompts
- emotional dependency systems
- fake relationship simulation
- surveillance-like monitoring

---

# 16. IMPORTANT MEMORY RULES

Memory must:
- remain lightweight
- stay explainable
- be inspectable by user
- allow deletion/reset

DO NOT create hidden memory systems.

User must always control memory.

---

# 17. PRODUCTIVITY DESIGN PRINCIPLES

Elysia should:
- encourage focus
- reduce overwhelm
- provide clarity
- support consistency

Avoid:
- guilt-based notifications
- aggressive reminders
- pressure-heavy UX

Tone should feel:
- tactical
- calm
- mission-oriented

---

# 18. PHASE 2 SUCCESS CRITERIA

Phase 2 succeeds when:

- Elysia remembers recent goals
- User can run focus sessions
- User can create reminders
- Assistant references past context naturally
- Notifications work locally
- Memory persists across restarts
- UI remains lightweight and immersive

---

# 19. FUTURE COMPATIBILITY

Prepare architecture compatibility for:

Future Phase 3:
- STT voice input
- TTS voice output
- overlay assistant mode
- VSCode awareness
- local semantic search
- vector memory
- desktop awareness

DO NOT implement yet.

---

# 20. ROLE OF THE AI CODING AGENT

The AI coding agent must act as:
- desktop systems engineer
- productivity systems architect
- memory systems engineer
- human-computer interaction engineer

The agent must prioritize:
- simplicity
- maintainability
- low resource usage
- modularity
- responsive UX

---

# 21. FINAL DIRECTIVE

Build Elysia as:
- a calm productivity companion
- a local-first assistant
- an ambient desktop presence

NOT:
- an AGI
- a toy chatbot
- a hyperactive anime mascot
- an autonomous agent framework

Focus on:
- continuity
- usefulness
- immersion
- consistency