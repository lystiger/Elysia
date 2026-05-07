# PROJECT SPECIFICATION
## Elysia Phase 3 — Voice, Presence & Contextual Awareness

---

# 1. PHASE OVERVIEW

Phase 3 transforms Elysia from a silent productivity companion into a conversational ambient assistant.

This phase introduces:
- voice interaction
- conversational presence
- contextual desktop awareness
- assistant attention orchestration
- immersive interaction systems

The goal is NOT autonomous AI.

The goal IS:
- natural interaction
- reduced friction
- stronger continuity
- calm ambient intelligence

---

# 2. CORE PHILOSOPHY

Elysia should feel like:
- a composed operator
- an ambient mission-control AI
- a calm support system

NOT:
- a hyperactive chatbot
- a toy anime mascot
- an AGI simulation
- an emotionally manipulative assistant

The assistant must prioritize:
- timing
- restraint
- clarity
- usefulness

---

# 3. PRIMARY PHASE GOALS

Implement:

1. Speech-to-text (STT)
2. Text-to-speech (TTS)
3. Conversational mode
4. Contextual awareness systems
5. Attention orchestration
6. Ambient interaction behavior
7. Presence refinement

---

# 4. VOICE INPUT SYSTEM (STT)

## Required Features

### Push-to-Talk Voice
- Hold key to speak
- Record microphone input
- Transcribe locally
- Inject transcription into prompt pipeline

### Voice Modes
- Push-to-talk only initially
- NO always-listening mode

---

## REQUIRED TECHNOLOGY

Use:
- faster-whisper

OR:
- whisper.cpp

Local-only processing preferred.

DO NOT use cloud STT APIs.

---

# 5. TEXT-TO-SPEECH SYSTEM (TTS)

## Goals

Elysia should:
- speak calmly
- avoid excessive talking
- support configurable voices
- stream responses naturally

---

## Recommended Technologies

Use:
- edge-tts
OR
- Piper TTS

Piper preferred for local-first architecture.

---

## TTS Behavior Rules

Elysia must:
- avoid interrupting user
- stop speaking immediately if interrupted
- support mute mode
- support text-only fallback

---

# 6. CONVERSATIONAL MODE

Introduce:
- voice conversation loop
- voice interruption support
- natural pause timing
- response pacing

---

## Interaction Flow

1. User presses voice key
2. STT transcription
3. Context assembly
4. LLM response generation
5. Stream text
6. Stream TTS playback
7. Return to ambient state

---

# 7. ATTENTION ORCHESTRATION SYSTEM

Implement:
- attention scoring
- notification priority
- interruption logic

---

## Purpose

Prevent:
- assistant spam
- overactive interruptions
- notification fatigue

---

## Example Logic

### High Priority
- reminder overdue
- focus session ending

### Medium Priority
- unfinished planned task

### Low Priority
- idle suggestion

### Ignore
- while user actively typing
- during fullscreen apps
- during focus mode

---

# 8. CONTEXTUAL DESKTOP AWARENESS

Implement lightweight awareness.

---

## Allowed Awareness

### Window Awareness
Track:
- active application name
- VSCode detection
- fullscreen detection

### Focus Awareness
Track:
- active focus sessions
- inactivity duration

---

## BANNED

DO NOT:
- capture screenshots
- record keystrokes
- inspect browser content
- monitor personal messages
- behave like spyware

Privacy-first architecture required.

---

# 9. CONTEXTUAL RESPONSE LAYER

Elysia should begin using:
- current project context
- active focus state
- recent summaries
- current active application

to improve responses.

---

## Example

If VSCode is active:
- prioritize technical/productivity tone

If idle long time:
- subtle focus reminder possible

---

# 10. AMBIENT PRESENCE SYSTEM V2

Expand assistant presence behaviors.

---

## Required Features

### Dynamic Status Messages
Examples:
- "Focus session active"
- "Monitoring current objective"
- "Awaiting input"

### Environmental Visual States
- softer idle breathing
- thinking shimmer
- focused glow modes
- nighttime dimming

---

# 11. VOICE UX REQUIREMENTS

The assistant voice should:
- feel calm
- speak slower than default
- avoid robotic pacing
- avoid excessive enthusiasm

DO NOT:
- use meme personalities
- overact emotionally
- use exaggerated anime speech

---

# 12. ARCHITECTURE EXPANSION

Create modular systems:

services/
  stt/
  tts/
  attention/
  awareness/
  context/

---

# 13. REQUIRED PERFORMANCE TARGETS

Voice systems must:
- remain responsive
- avoid blocking UI
- support interruption
- stream incrementally

The assistant must continue feeling lightweight.

---

# 14. MEMORY SYSTEM EXPANSION

Memory retrieval now includes:
- active app context
- recent voice summaries
- focus state

Still:
- lightweight
- retrieval-based
- summary-oriented

NO vector DB yet unless absolutely necessary.

---

# 15. NEW ASSISTANT STATES

Add:

- speaking
- observing
- interrupted
- focused
- dormant

Transitions must remain smooth.

---

# 16. PRODUCTIVITY INTEGRATION

Elysia should now support:

- verbal reminders
- spoken focus summaries
- spoken session completion
- lightweight planning conversations

Example:
"You planned to continue the inference dashboard today."

---

# 17. USER CONTROL REQUIREMENTS

User must be able to:
- mute assistant
- disable voice
- disable awareness
- clear memory
- disable notifications

Transparency is mandatory.

---

# 18. BANNED FEATURES

DO NOT IMPLEMENT:
- always-on microphone
- autonomous browsing
- self-prompt loops
- emotional dependency systems
- fake sentience
- manipulative UX
- surveillance features
- autonomous decision-making

---

# 19. FUTURE PHASE COMPATIBILITY

Prepare architecture compatibility for:

Phase 4:
- semantic memory
- local vector retrieval
- VSCode extension integration
- workflow orchestration
- plugin/tool systems
- proactive workflow assistance

DO NOT implement now.

---

# 20. PHASE 3 SUCCESS CRITERIA

Phase 3 succeeds when:

- User can speak to Elysia
- Elysia responds with voice
- Voice interruption works
- Contextual awareness improves responses
- Notifications feel intelligent
- Assistant presence feels ambient
- The assistant remains calm and non-intrusive

---

# 21. ROLE OF THE AI CODING AGENT

The AI coding agent must act as:
- voice systems engineer
- desktop systems architect
- HCI engineer
- AI orchestration engineer

The agent must prioritize:
- responsiveness
- privacy
- timing
- low-latency interaction
- modularity

---

# 22. FINAL DIRECTIVE

Build Elysia into:
- a calm conversational desktop companion
- a local-first ambient AI system
- a productivity-oriented assistant

NOT:
- a surveillance system
- a noisy virtual mascot
- an AGI roleplay simulator
- a dependency-driven companion

Focus on:
- conversational presence
- contextual awareness
- subtle intelligence
- timing
- continuity