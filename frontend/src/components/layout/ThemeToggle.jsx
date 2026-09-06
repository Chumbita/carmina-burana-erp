import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const THEME_KEY = "theme";

function getInitialDarkMode() {
  const savedTheme = localStorage.getItem(THEME_KEY);

  if (savedTheme === "dark") return true;
  if (savedTheme === "light") return false;

  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(getInitialDarkMode);
  const label = isDark ? "Activar modo día" : "Activar modo noche";

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
  }, [isDark]);

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="relative transition-transform duration-200 hover:scale-105 active:scale-95"
      aria-label={label}
      title={label}
      onClick={() => setIsDark((current) => !current)}
    >
      <Moon
        className={cn(
          "absolute h-5 w-5 text-gray-600 transition-all duration-200 dark:text-gray-200",
          isDark ? "-rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
        )}
      />
      <Sun
        className={cn(
          "absolute h-5 w-5 text-gray-600 transition-all duration-200 dark:text-gray-200",
          isDark ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-0 opacity-0"
        )}
      />
    </Button>
  );
}
