"use client";
import { createContext, useContext } from "react";

const LearningOwner = createContext<string | null>(null);

export function LearningOwnerProvider({ ownerId, children }: { ownerId: string; children: React.ReactNode }) {
  return <LearningOwner.Provider value={ownerId}>{children}</LearningOwner.Provider>;
}

export function useLearningOwner() {
  const ownerId = useContext(LearningOwner);
  if (!ownerId) throw new Error("Learning owner is required.");
  return ownerId;
}
