"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

type Branch = { id: string; name: string };

type BranchContextType = {
  activeBranch: Branch | null;
  branches: Branch[];
  setActiveBranch: (branch: Branch) => void;
  restaurantName: string | null;
};

export const BranchContext = createContext<BranchContextType | null>(null);

const COOKIE_NAME = "fidely_active_branch";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

function readCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp("(?:^|; )" + COOKIE_NAME + "=([^;]*)")
  );
  return match ? decodeURIComponent(match[1]) : null;
}

function writeCookie(value: string) {
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(value)}; max-age=${COOKIE_MAX_AGE}; path=/`;
}

export function BranchProvider({
  branches,
  restaurantName,
  children,
}: {
  branches: Branch[];
  restaurantName: string | null;
  children: ReactNode;
}) {
  const [activeBranch, setActiveBranchState] = useState<Branch | null>(null);

  useEffect(() => {
    const savedId = readCookie();
    const found = branches.find((b) => b.id === savedId);
    setActiveBranchState(found ?? branches[0] ?? null);
  }, [branches]);

  function setActiveBranch(branch: Branch) {
    setActiveBranchState(branch);
    writeCookie(branch.id);
  }

  return (
    <BranchContext.Provider value={{ activeBranch, branches, setActiveBranch, restaurantName }}>
      {children}
    </BranchContext.Provider>
  );
}

export function useBranch() {
  const ctx = useContext(BranchContext);
  if (!ctx) throw new Error("useBranch must be used inside BranchProvider");
  return ctx;
}
