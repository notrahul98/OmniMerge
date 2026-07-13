import { useState, useCallback, useMemo } from "react";
import {
  TrialBalance,
  AccountMapping,
  EliminationEntry,
} from "../types";
import {
  consolidateTrialBalances,
  detectIntercompanyAccounts,
} from "../utils/consolidation";
import {
  autoDetectMappings,
  loadMapping,
} from "../utils/account-mapping";

export function useConsolidation(trialBalances: TrialBalance[]) {
  const [mappings, setMappings] = useState<Map<string, AccountMapping>>(
    new Map()
  );
  const [eliminations, setEliminations] = useState<EliminationEntry[]>([]);
  const [manualError, setManualError] = useState<string | null>(null);

  // Auto-detect mappings when trial balances change
  const autoMappings = useMemo(() => {
    if (trialBalances.length === 0) return new Map();
    try {
      return autoDetectMappings(trialBalances);
    } catch (err) {
      console.error("Error auto-detecting mappings:", err);
      return new Map();
    }
  }, [trialBalances]);

  const initializeAutoMappings = useCallback(() => {
    setMappings(autoMappings);
    setManualError(null);
  }, [autoMappings]);

  const loadSavedMapping = useCallback((mappingId: string) => {
    try {
      const loaded = loadMapping(mappingId);
      if (loaded) {
        const map = new Map<string, AccountMapping>();
        loaded.forEach((m) => {
          map.set(m.id, m);
        });
        setMappings(map);
        setManualError(null);
      } else {
        setManualError("Failed to load mapping");
      }
    } catch (err) {
      setManualError(
        err instanceof Error ? err.message : "Failed to load mapping"
      );
    }
  }, []);

  const updateMapping = useCallback(
    (id: string, mapping: AccountMapping) => {
      setMappings((prev) => {
        const updated = new Map(prev);
        updated.set(id, mapping);
        return updated;
      });
    },
    []
  );

  const addElimination = useCallback((elimination: EliminationEntry) => {
    setEliminations((prev) => [...prev, elimination]);
  }, []);

  const removeElimination = useCallback((eliminationId: string) => {
    setEliminations((prev) => prev.filter((e) => e.id !== eliminationId));
  }, []);

  const updateElimination = useCallback(
    (id: string, elimination: EliminationEntry) => {
      setEliminations((prev) =>
        prev.map((e) => (e.id === id ? elimination : e))
      );
    },
    []
  );

  const clearEliminations = useCallback(() => {
    setEliminations([]);
  }, []);

  const { consolidated, error: computedError } = useMemo(() => {
    if (trialBalances.length === 0) {
      return { consolidated: null, error: "No trial balances loaded" };
    }

    if (mappings.size === 0) {
      return {
        consolidated: null,
        error: "No account mappings defined. Please auto-detect or create mappings.",
      };
    }

    try {
      const result = consolidateTrialBalances(
        trialBalances,
        mappings,
        eliminations
      );
      return { consolidated: result, error: null as string | null };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to consolidate";
      return { consolidated: null, error: message };
    }
  }, [trialBalances, mappings, eliminations]);

  const error = manualError ?? computedError;

  const detectIntercompany = useCallback(() => {
    try {
      return detectIntercompanyAccounts(trialBalances);
    } catch (err) {
      console.error("Error detecting intercompany accounts:", err);
      return [];
    }
  }, [trialBalances]);

  return {
    mappings,
    eliminations,
    error,
    autoMappings,
    initializeAutoMappings,
    loadSavedMapping,
    updateMapping,
    addElimination,
    removeElimination,
    updateElimination,
    clearEliminations,
    consolidated,
    detectIntercompany,
  };
}
