import { useEffect, useRef } from "react";

const STICK_THRESHOLD_PX = 80;

// Scrolls a container to the bottom whenever `dependency` changes, but only
// if the user was already near the bottom — so streaming tokens don't yank
// the view out from under someone who scrolled up to re-read something.
export function useAutoScroll<T extends HTMLElement>(dependency: unknown) {
  const ref = useRef<T | null>(null);
  const stickToBottom = useRef(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function handleScroll() {
      const distanceFromBottom = el!.scrollHeight - el!.scrollTop - el!.clientHeight;
      stickToBottom.current = distanceFromBottom < STICK_THRESHOLD_PX;
    }

    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || !stickToBottom.current) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [dependency]);

  return ref;
}
