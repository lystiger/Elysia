# Elysia

Elysia is a local-first desktop AI companion built with Electron, React, TypeScript, and Ollama.

## Phase 1

The current implementation covers the first usable shell described in [docs/1stphase.md](/home/lystiger/projects/Elysia/docs/1stphase.md):

- Electron desktop runtime
- React + Tailwind renderer
- reactive avatar stage with state transitions
- prompt composer with `T` global hotkey focus
- streamed Ollama responses from `POST /api/generate`
- local-only conversation history panel

## Default runtime

- Ollama endpoint: `http://localhost:11434`
- Default model: `qwen3:8b`

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

## Structure

```text
electron/       Electron main and preload bridge
src/components  UI building blocks
src/services    Ollama transport
src/state       App state and orchestration
docs/           Project specifications
```
