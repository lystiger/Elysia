#!/usr/bin/env bash
set -e
docker pull ollama/ollama:latest
docker rm -f elysia 2>/dev/null || true
docker run -d --name elysia --restart unless-stopped -p 127.0.0.1:11434:11434 \
  -v /data/elysia/ollama:/root/.ollama \
  -v /data/models:/models:ro \
  -v "$HOME/.local/share/elysia/Modelfile:/Modelfile:ro" \
  -v "$HOME/Documents/Second-Brain:/vault:ro" \
  -v "$HOME/Documents/Second-Brain/📥 Inbox/Elysia:/vault/📥 Inbox/Elysia:rw" \
  ollama/ollama:latest
sleep 6
docker exec elysia ollama create elysia -f /Modelfile
docker exec elysia ollama list
