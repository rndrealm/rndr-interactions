"use client";

import { createContext, useContext, useRef, useCallback, useState } from "react";
import type { Asset } from "@/components/composer/upload-button";
import type { ModelId } from "@/components/composer/model-switcher";

export type ComposerState = {
  html: string;
  assets: Asset[];
  model: ModelId;
};

export type PendingContext = {
  content: string;
  fileName: string;
  imageUrl?: string;
};

type ComposerStore = {
  save: (tabId: string, patch: Partial<ComposerState>) => void;
  load: (tabId: string) => ComposerState | undefined;
  remove: (tabId: string) => void;
  pendingContext: PendingContext | null;
  setPendingContext: (ctx: PendingContext | null) => void;
  consumePendingContext: () => PendingContext | null;
};

const ComposerStoreContext = createContext<ComposerStore | null>(null);

export function ComposerStoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const cacheRef = useRef(new Map<string, ComposerState>());
  const [pendingContext, setPendingContext] = useState<PendingContext | null>(null);

  const save = useCallback(
    (tabId: string, patch: Partial<ComposerState>) => {
      const existing = cacheRef.current.get(tabId);
      cacheRef.current.set(tabId, { ...existing, ...patch } as ComposerState);
    },
    [],
  );

  const load = useCallback((tabId: string) => {
    return cacheRef.current.get(tabId);
  }, []);

  const remove = useCallback((tabId: string) => {
    cacheRef.current.delete(tabId);
  }, []);

  const consumePendingContext = useCallback(() => {
    let consumed: PendingContext | null = null;
    setPendingContext((prev) => {
      consumed = prev;
      return null;
    });
    return consumed;
  }, []);

  return (
    <ComposerStoreContext
      value={{ save, load, remove, pendingContext, setPendingContext, consumePendingContext }}
    >
      {children}
    </ComposerStoreContext>
  );
}

export function useComposerStore() {
  const store = useContext(ComposerStoreContext);
  if (!store) {
    throw new Error("useComposerStore must be used within ComposerStoreProvider");
  }
  return store;
}
