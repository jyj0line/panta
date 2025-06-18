"use client";

import { type DependencyList, useEffect } from "react";

type TMUpdaterProps = {
  dependency: unknown
}

export const TMUpdater = ({
  dependency
}: TMUpdaterProps) => {
  useEffect(() => {
    document.title = `${dependency} | Panta`;
  }, [dependency]);

  return null;
}