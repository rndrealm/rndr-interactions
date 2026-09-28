"use client";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

/** Secondary sale, so both prices are already on the contract — the page only
 *  quotes them. */
export const BUY_NOW_ETH = 0.01;
export const RESERVE_ETH = 0.05;

/** Stand-in for waiting on a transaction to confirm. */
const CONFIRM_MS = 1800;

export type PurchaseStatus = "idle" | "confirming" | "owned";

type ListingValue = {
  status: PurchaseStatus;
  buy: () => void;
  /** Whoever the token points at right now — the seller, or you once it clears. */
  owner: string;
};

const SELLER = "rndrealm";

const ListingContext = createContext<ListingValue | null>(null);

export function ListingProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<PurchaseStatus>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const buy = useCallback(() => {
    if (status !== "idle") return;

    setStatus("confirming");
    timer.current = setTimeout(() => setStatus("owned"), CONFIRM_MS);
  }, [status]);

  const value = useMemo(
    () => ({ status, buy, owner: status === "owned" ? "you" : SELLER }),
    [status, buy],
  );

  return (
    <ListingContext.Provider value={value}>{children}</ListingContext.Provider>
  );
}

export function useListing() {
  const value = useContext(ListingContext);
  if (!value) {
    throw new Error("useListing must be used inside <ListingProvider>");
  }
  return value;
}

/** Both the card and the provenance quote ETH, and both need the same 2dp. */
export function eth(amount: number) {
  return amount.toFixed(2) + " ETH";
}
