import { PrismLight } from "react-syntax-highlighter";
import bash from "react-syntax-highlighter/dist/esm/languages/prism/bash";
import cpp from "react-syntax-highlighter/dist/esm/languages/prism/cpp";
import docker from "react-syntax-highlighter/dist/esm/languages/prism/docker";
import go from "react-syntax-highlighter/dist/esm/languages/prism/go";
import java from "react-syntax-highlighter/dist/esm/languages/prism/java";
import javascript from "react-syntax-highlighter/dist/esm/languages/prism/javascript";
import json from "react-syntax-highlighter/dist/esm/languages/prism/json";
import powershell from "react-syntax-highlighter/dist/esm/languages/prism/powershell";
import python from "react-syntax-highlighter/dist/esm/languages/prism/python";
import rust from "react-syntax-highlighter/dist/esm/languages/prism/rust";
import sql from "react-syntax-highlighter/dist/esm/languages/prism/sql";
import typescript from "react-syntax-highlighter/dist/esm/languages/prism/typescript";
import yaml from "react-syntax-highlighter/dist/esm/languages/prism/yaml";

const registered = {
  python,
  typescript,
  ts: typescript,
  javascript,
  js: javascript,
  jsx: javascript,
  tsx: typescript,
  cpp,
  "c++": cpp,
  rust,
  rs: rust,
  go,
  golang: go,
  java,
  bash,
  sh: bash,
  shell: bash,
  json,
  yaml,
  yml: yaml,
  sql,
  docker,
  dockerfile: docker,
  powershell,
  ps1: powershell
} as const;

export type RegisteredLanguage = keyof typeof registered;

let registeredOnce = false;

export function ensureLanguagesRegistered() {
  if (registeredOnce) return;
  for (const [name, definition] of Object.entries(registered)) {
    PrismLight.registerLanguage(name, definition);
  }
  registeredOnce = true;
}

export function isRegisteredLanguage(language: string): language is RegisteredLanguage {
  return language.toLowerCase() in registered;
}
