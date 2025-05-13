import { ChevronUp } from "lucide-react";
import ScrollToTopLib from "react-scroll-to-top";

interface ScrollToTopProps {
  smooth?: boolean;
  top?: number;
  className?: string;
}

export function ScrollToTop({ smooth = true, top = 100, className = "" }: ScrollToTopProps) {
  return (
    <ScrollToTopLib 
      smooth={smooth}
      top={top}
      className={`flex items-center justify-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 p-2 rounded-full shadow-lg transition-all ${className}`}
      component={<ChevronUp size={20} />}
    />
  );
} 