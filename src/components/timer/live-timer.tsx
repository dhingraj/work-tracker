"use client";

import { useEffect, useState } from "react";

import { formatMinutes } from "@/lib/utils";

function elapsedMinutes(startedAt: string) {
  return Math.max(0, Math.round((Date.now() - new Date(startedAt).getTime()) / 60000));
}

export function LiveTimer({ startedAt }: { startedAt: string }) {
  const [minutes, setMinutes] = useState(() => elapsedMinutes(startedAt));

  useEffect(() => {
    setMinutes(elapsedMinutes(startedAt));
    const interval = window.setInterval(() => {
      setMinutes(elapsedMinutes(startedAt));
    }, 15000);

    return () => window.clearInterval(interval);
  }, [startedAt]);

  return <span>{formatMinutes(minutes)}</span>;
}
