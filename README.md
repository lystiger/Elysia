# Elysia

Elysia is a local-first desktop AI companion built with Electron, React, TypeScript, and Ollama, with a chat UI inspired by Open WebUI.

## Phase 1

The current implementation covers the first usable shell described in [docs/1stphase.md](/home/lystiger/projects/Elysia/docs/1stphase.md):

- Electron desktop runtime
- React + Tailwind renderer
- Open WebUI-style sidebar + chat layout with a model selector and "New chat" action
- prompt composer with `T` global hotkey focus
- streamed Ollama responses from `POST /api/generate`
- local-only conversation history panel

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

2. Launch the app (`npm run dev` or the packaged build). The sidebar shows the active model (defaults to `gemma4:e4b`) — edit the field to switch to any other model you have pulled locally.
3. Type a prompt in the composer and press `Enter` (Shift+Enter for a newline) to send it. The response streams into the chat feed in real time.
4. Press `T` anywhere in the window to refocus the composer, or click "New chat" in the sidebar to clear the current conversation and start over.

If Ollama isn't running or the model name doesn't match a pulled model, the assistant reply is replaced with the error returned by Ollama.

## Structure

```text
electron/       Electron main and preload bridge
src/components  UI building blocks
src/services    Ollama transport
src/state       App state and orchestration
docs/           Project specifications
```
