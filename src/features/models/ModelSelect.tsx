import { useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { listOllamaModels } from "../../services/ollama";
import { useAssistantStore } from "../../state/assistantStore";

export function ModelSelect() {
  const activeModel = useAssistantStore((store) => store.activeModel);
  const availableModels = useAssistantStore((store) => store.availableModels);
  const setActiveModel = useAssistantStore((store) => store.setActiveModel);
  const setAvailableModels = useAssistantStore((store) => store.setAvailableModels);

  useEffect(() => {
    let cancelled = false;

    listOllamaModels()
      .then((models) => {
        if (!cancelled && models.length > 0) {
          setAvailableModels(models);
        }
      })
      .catch(() => {
        // Ollama unreachable — keep whatever model is already set.
      });

    return () => {
      cancelled = true;
    };
  }, [setAvailableModels]);

  const options = availableModels.includes(activeModel) ? availableModels : [activeModel, ...availableModels];

  return (
    <div className="relative">
      <select
        value={activeModel}
        onChange={(event) => setActiveModel(event.target.value)}
        className="w-full appearance-none rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 pr-8 text-sm text-cyan-100 outline-none transition-all duration-200 hover:border-white/20 focus:border-cyan-300/40 focus:shadow-glow-soft"
      >
        {options.map((model) => (
          <option key={model} value={model}>
            {model}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-500" />
    </div>
  );
}
