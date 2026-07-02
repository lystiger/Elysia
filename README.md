# Elysia

Elysia is a local-first desktop AI companion built with Electron, React, TypeScript, and Ollama. It's designed to feel like an ambient companion presence rather than a chatbot — a breathing orb at the center of the window, not a message thread.

## Phase 1

The current implementation covers the first usable shell described in [docs/1stphase.md](/home/lystiger/projects/Elysia/docs/1stphase.md):

- Electron desktop runtime
- React + Tailwind renderer
- Central animated orb reflecting assistant state (ready, thinking, generating, offline)
- Floating current-exchange dialogue with a collapsible slide-over for full session history
- Sidebar with model selector, connection status, and pinned-project shortcuts
- prompt composer with `Shift+O` global hotkey focus
- streamed Ollama responses from `POST /api/generate`

## Default runtime

- Ollama endpoint: `http://localhost:11434`
- Default model: `gemma4:e4b`

The model is configured in the client state layer and is not hardcoded into the transport itself.

## Development

Install dependencies:

```bash
npm install
```

Run the desktop app in development mode:

```bash
npm run dev
```

If Electron fails on Linux with a missing shared library such as `libasound.so.2`, install the required desktop runtime packages first. On Debian/Ubuntu systems that commonly means at least:

```bash
sudo apt install libasound2 libnss3 libxss1 libgtk-3-0 libxkbcommon0
```

Build the renderer and Electron main/preload bundles:

```bash
npm run build
```

## Usage

1. Start Ollama and make sure the model you want is pulled and available:

   ```bash
   ollama list
   ```

2. Launch the app (`npm run dev` or the packaged build). The sidebar's Model dropdown is populated from `GET /api/tags` and defaults to `gemma4:e4b`; pick any other pulled model from the list.
3. Type a prompt in the floating command bar and press `Enter` (Shift+Enter for a newline) to send it. The orb shifts from Ready → Thinking → Generating as the response streams in, and the latest exchange appears as a floating card above the command bar.
4. Click "N earlier messages" under the current exchange to open the full session history in a slide-over drawer. Press `Shift+O` anywhere in the window to refocus the composer, or click "New chat" in the sidebar to clear the conversation and start over.

The sidebar's Status pill reflects live Ollama reachability (checked on load and every 20s), independent of the per-message pipeline state. If Ollama isn't running or the model name doesn't match a pulled model, the assistant reply is replaced with the error returned by Ollama and the orb turns red.

## Workspaces

Every conversation belongs to a **workspace** — a project environment (AOI, Computer
Architecture, SignGlove, Elysia, Research, or the default General). Workspaces are seeded
on first run and persisted locally as JSON under `data/memory/`
(`workspaces.json` + `conversations.json`).

- Open the workspace navigator from the top-left panel button: quick-access **Pinned** and
  **Recent** conversations plus every workspace, each expandable to its own conversations.
- Switching a workspace filters its conversations, updates the greeting and suggestion chips,
  and auto-selects that workspace's preferred model. The last opened workspace is remembered.
- Opening a workspace shows its landing page — recent activity, contextual suggestions, and
  recent conversations — until you open or start a chat.
- A new chat belongs to the current workspace (General if none is selected).
- Press **Ctrl/Cmd+K** for the command palette: search across workspaces, conversation titles,
  and recent messages, or run New Chat / Switch Workspace / Change Model / Open Settings.
  Memory, Voice, and Vision appear as future placeholders.

The architecture is layered so later phases (documents, images, code, memory, tasks) can attach
to a workspace without reshaping the conversation contract: `domain/` (types + queries) →
`services/storage` repositories (independent `WorkspaceRepository` / `ConversationRepository`) →
`services/workspace` (`WorkspaceService`) → `state/workspaceStore` → `features/workspaces`
(`WorkspaceContext` + UI).

## Structure

```text
electron/               Electron main and preload bridge
src/app                 Renderer bootstrap and application shell
src/components           Shared UI primitives (orb, dialogue, composer, drawers)
src/features/workspaces  Workspace navigator, landing page, command palette, context
src/domain               Workspace / conversation / message models and queries
src/services             Ollama transport, JSON storage, workspace service
src/state                Assistant and workspace orchestration stores
docs/                    Project specifications
```
