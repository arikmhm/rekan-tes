import * as React from "react";

const MOBILE_BREAKPOINT = 768;

/**
 * Versi bawaan shadcn memanggil `setState` langsung di dalam efek, yang ditolak
 * lint React compiler karena memicu render berantai. `useSyncExternalStore`
 * adalah cara React membaca sumber di luar React seperti `matchMedia`, sekaligus
 * memberi snapshot server yang eksplisit.
 */
function subscribe(onChange: () => void) {
  const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

export function useIsMobile() {
  return React.useSyncExternalStore(
    subscribe,
    () => window.innerWidth < MOBILE_BREAKPOINT,
    // Di server lebar layar tidak diketahui; anggap desktop seperti versi asli.
    () => false,
  );
}
