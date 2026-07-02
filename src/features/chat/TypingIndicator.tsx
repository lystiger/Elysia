import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const SLOW_HINT_DELAY_MS = 20000;

export function TypingIndicator() {
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), SLOW_HINT_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map((index) => (
          <motion.span
            key={index}
            className="size-1.5 rounded-full bg-slate-400"
            animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
            transition={{ duration: 1, repeat: Infinity, delay: index * 0.15, ease: "easeInOut" }}
          />
        ))}
      </div>
      {slow ? (
        <p className="text-xs text-slate-500">Still thinking — local models can take a while on the first response.</p>
      ) : null}
    </div>
  );
}
