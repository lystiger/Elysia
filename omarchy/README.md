# Elysia on Omarchy

Local assistant: Qwen3.5 4B in an `ollama/ollama` Docker container, a bar panel tab with Sleep/Wake, and a read-only pi agent over the Second Brain vault.

| File | Purpose |
|---|---|
| `setup.sh` | Pull the image, start the `elysia` container, build the `elysia` model from the GGUF in `/data/models` |
| `Modelfile` | Persona, ChatML template, `num_ctx 8192` |
| `persona.md` | System prompt for the pi harness |
| `elysia-chat` | Terminal chat (`docker exec ... ollama run --think=false elysia`), registers a job in the WS1 jobs pane |
| `elysia-pi` | pi harness on her model, `read` tool only, vault as cwd, registers a job |
| `pi/models.json` | pi provider for the local Ollama (`reasoning: true` so `--thinking off` maps to `reasoning_effort: none`) |
| `panel/ElysiaSection.qml` | Elysia tab: status, Sleep/Wake, Chat, Agent (pi) |
| `panel/Panel.qml.patch` | Tab bar (LysAgents / LysApp / Elysia) on a copy of Omarchy's agents plugin |

Install: copy the scripts to `~/.local/bin`, run `setup.sh`, copy `pi/models.json` to `~/.pi/agent/`, copy `panel/*` into `~/.config/omarchy/plugins/lysomarchy.agents/` (a copy of `/usr/share/omarchy/shell/plugins/agents` with the patch applied and a LysApp section), then `omarchy-restart-shell`.

Notes: the vault is mounted read-only in the container except `📥 Inbox/Elysia`. pi runs on the host, so it gets `read` only. CPU inference is about 7 tokens/second. Run the model with thinking off.
