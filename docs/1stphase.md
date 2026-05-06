# PROJECT SPECIFICATION
## Project Codename: Elysia

---
# 0.5. ROLE
You are an senior engineer that trying to build your own AI assistant for automation and companion since you are a bit lonely


# 1. PROJECT OVERVIEW

Elysia is a local desktop AI companion assistant inspired by virtual AI assistants such as Jarvis in Ironman.

The assistant is NOT intended to be a full autonomous AGI system.

Phase 1 focuses on:
- desktop GUI
- local LLM integration
- character/avatar rendering
- push-to-talk interaction
- streaming AI responses
- reactive visual states

The assistant must feel alive and responsive despite minimal animation.

This project prioritizes:
- responsiveness
- clean architecture
- modularity
- future expandability
- local-first inference

---

# 2. PRIMARY OBJECTIVES

The application must:

1. Render a customizable character image
2. Support local AI models through Ollama
3. Allow user interaction through push-to-talk hotkey
4. Display streamed AI responses
5. Visually react to AI states
6. Operate completely offline/local
7. Be modular for future voice/memory/tool upgrades

---

# 3. CURRENT PHASE SCOPE

## INCLUDED

### Core Desktop App
- Electron application
- React frontend
- Local backend bridge

### Character System
- Import PNG/JPEG avatar
- Render avatar on screen
- State-based visual effects

### AI Integration
- Connect to Ollama API
- Send prompts
- Stream responses

### Interaction
- Push-to-talk keybind (T)
- Text input box
- Enter to send

### Visual States
- Idle
- Listening
- Thinking
- Responding

### Response Display
- Streaming text output
- Typing effect
- Scrollable history

---

## EXCLUDED (FOR NOW)

DO NOT IMPLEMENT:
- Voice recognition
- Text-to-speech
- Memory systems
- RAG/vector database
- Autonomous actions
- Browser control
- File manipulation agents
- Multi-agent systems
- Cloud AI APIs
- Authentication
- Multiplayer/networking
- Database systems

These belong to future phases.

---

# 4. TECH STACK

## Frontend
- React
- TypeScript
- TailwindCSS
- Framer Motion

## Desktop Runtime
- Electron

## Backend/Bridge
- Node.js

## AI Runtime
- Ollama local API

## Build Tool
- Vite

---

# 5. REQUIRED LIBRARIES

## Frontend
- react
- react-dom
- framer-motion
- lucide-react
- clsx

## Electron
- electron
- electron-builder
- concurrently
- wait-on

## Utilities
- axios

---

# 6. OLLAMA INTEGRATION

Use Ollama local API.

Default endpoint:

http://localhost:11434

Use:
POST /api/generate

Must support:
- streaming responses
- configurable model selection

Default model:
qwen3:8b

DO NOT hardcode models.

---

# 7. UI DESIGN REQUIREMENTS

## Style Direction
- futuristic
- minimal
- cyberpunk-inspired
- clean
- soft glows
- dark mode first

## Avatar Area
The avatar must:
- be centered
- support PNG/JPEG
- support transparent backgrounds
- visually react to states

## State Effects

### Idle
- subtle breathing effect

### Listening
- blue glow pulse

### Thinking
- rotating ring or shimmer

### Responding
- brighter glow
- response text active

### Error
- red flash or red border

---

# 8. INTERACTION FLOW

## Flow

1. User presses T
2. Input mode activates
3. User types prompt
4. Prompt sent to Ollama
5. Character enters thinking state
6. Stream response live
7. Character enters responding state
8. Return to idle

---

# 9. ARCHITECTURE REQUIREMENTS

The project MUST be modular.

## Suggested structure

src/
  components/
  features/
  services/
  hooks/
  state/
  assets/
  electron/

---

# 10. CODING RULES

## General
- Use TypeScript strictly
- Avoid any
- Functional components only
- Reusable components
- Clean separation of concerns

## React
- Use hooks
- Avoid class components
- Keep components small

## Styling
- Tailwind only
- No inline CSS unless necessary

## State
- Lightweight state management
- Prefer Context or Zustand

---

# 11. PERFORMANCE REQUIREMENTS

The application should:
- launch quickly
- remain lightweight
- avoid unnecessary rerenders
- stream responses smoothly
- support low/mid-range laptops

---

# 12. BANNED PRACTICES

DO NOT:
- use Python GUI frameworks
- use Tkinter
- use PyQt
- use heavy game engines
- use Next.js
- use Redux unless necessary
- use jQuery
- use blocking API calls
- hardcode avatar assets
- hardcode AI models

---

# 13. FUTURE EXPANSION COMPATIBILITY

Architecture must support future upgrades:

- voice input
- text-to-speech
- memory/RAG
- multiple personalities
- overlay mode
- global desktop assistant
- system tray mode
- autonomous tools
- file analysis
- coding assistant mode

DO NOT implement now.
ONLY prepare architecture compatibility.

---

# 14. USER EXPERIENCE GOALS

The assistant should feel:
- responsive
- calm
- intelligent
- lightweight
- personal
- immersive

Even simple visual reactions should create emotional presence.

---

# 15. DEVELOPMENT PRIORITY

Priority order:

1. Electron shell
2. Avatar rendering
3. Ollama connectivity
4. Streaming responses
5. Push-to-talk
6. State effects
7. UI polish

---

# 16. DELIVERABLES

The generated application must include:

- runnable Electron app
- clean project structure
- setup instructions
- environment configuration
- model configuration
- avatar import support

---

# 17. SUCCESS CRITERIA

Phase 1 is considered successful when:

- User can launch desktop app
- User can press T
- User can send prompt
- Local Ollama model responds
- Responses stream live
- Character visually reacts
- App feels smooth and immersive

---

# 18. IMPORTANT CONSTRAINTS

This is NOT:
- a chatbot webpage
- a browser app
- a cloud AI platform
- an AGI framework

This IS:
- a local desktop AI companion shell
- a foundation for future Jarvis-like expansion

---

# 19. ROLE OF THE AI CODING AGENT

The AI coding agent must act as:
- senior software architect
- UI engineer
- Electron engineer
- local AI integration engineer

The agent must:
- prioritize maintainability
- avoid unnecessary complexity
- build incrementally
- produce production-quality structure

---

# 20. FINAL INSTRUCTION

Build Phase 1 only.

Do not overengineer.
Do not add unrequested features.
Focus on stability, responsiveness, and immersive interaction.