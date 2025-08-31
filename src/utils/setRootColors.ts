import type { WhitelabelColors } from "@/types";

export function setRootColors(colors: WhitelabelColors) {
  const root = document.documentElement;

  Object.entries(colors).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value);
  });
}
