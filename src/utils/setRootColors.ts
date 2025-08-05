import type { WhitelabelColors } from "@/stores/whitelabel";

export function setRootColors(colors: WhitelabelColors) {
  const root = document.documentElement;

  Object.entries(colors).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value);
  });
}
