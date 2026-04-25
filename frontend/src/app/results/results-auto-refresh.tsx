"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

type ResultsAutoRefreshProps = {
  enabled: boolean;
};

export function ResultsAutoRefresh({ enabled }: ResultsAutoRefreshProps) {
  const router = useRouter();

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const intervalId = window.setInterval(() => {
      router.refresh();
    }, 3000);

    return () => window.clearInterval(intervalId);
  }, [enabled, router]);

  return null;
}
