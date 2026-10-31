"use client";

import { useEffect } from "react";

/**
 * Phones: the header and the tab bar slide away while the page scrolls down and come back on the way up, so a
 * question and all its answers fit on screen. Sets data-chrome="hidden" on <html>; the `chrome-hidden:` variant
 * (globals.css) moves them.
 */
export function ScrollChrome() {
  useEffect(() => {
    const root = document.documentElement;
    let last = window.scrollY;
    let frame = 0;

    const update = () => {
      frame = 0;
      const y = window.scrollY;
      // Small jitters (and iOS bounce) don't toggle; near the top they always show.
      if (y > 64 && Math.abs(y - last) < 8) return;
      if (y > 64 && y > last) root.dataset.chrome = "hidden";
      else delete root.dataset.chrome;
      last = y;
    };
    const onScroll = () => {
      frame ||= requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
      delete root.dataset.chrome;
    };
  }, []);
  return null;
}
