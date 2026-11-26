# Elysia on Omarchy

Local assistant: Qwen3.5 4B in an `ollama/ollama` Docker container with a bar panel tab (Sleep/Wake, Chat).

| File | Purpose |
|---|---|
| `setup.sh` | Pull the image, start the `elysia` container, build the `elysia` model from the GGUF in `/data/models` |
| `Modelfile` | Persona, ChatML template, `num_ctx 8192` |
| `elysia-chat` | Terminal chat (`docker exec ... ollama run --think=false elysia`), registers a job in the WS1 jobs pane |
| `panel/ElysiaSection.qml` | Elysia tab: status, Sleep/Wake, Chat |
| `panel/Panel.qml.patch` | Tab bar (LysAgents / LysApp / Elysia) on a copy of Omarchy's agents plugin |

Install: copy the scripts to `~/.local/bin`, run `setup.sh`, copy `panel/*` into `~/.config/omarchy/plugins/lysomarchy.agents/` (a copy of `/usr/share/omarchy/shell/plugins/agents` with the patch applied and a LysApp section), then `omarchy-restart-shell`.

Notes: the vault is mounted read-only in the container except `📥 Inbox/Elysia`. Dropped the pi agent harness: too slow to load on CPU. CPU inference is about 7 tokens/second. Run the model with thinking off.
