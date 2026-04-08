"use client";

import { useEffect } from "react";

function scrollToCurrentHash() {
  const hash = window.location.hash;
  if (!hash) return;

  const id = hash.startsWith("#") ? hash.slice(1) : hash;
  if (!id) return;

  const target = document.getElementById(id);
  if (!target) return;

  target.scrollIntoView({ block: "start" });
}

export function HashScroller() {
  useEffect(() => {
    // Wait for layout and images to settle a bit before jumping.
    const raf1 = requestAnimationFrame(() => {
      const raf2 = requestAnimationFrame(() => {
        scrollToCurrentHash();
      });
      return () => cancelAnimationFrame(raf2);
    });

    function onHashChange() {
      scrollToCurrentHash();
    }

    window.addEventListener("hashchange", onHashChange);

    return () => {
      cancelAnimationFrame(raf1);
      window.removeEventListener("hashchange", onHashChange);
    };
  }, []);

  return null;
}

