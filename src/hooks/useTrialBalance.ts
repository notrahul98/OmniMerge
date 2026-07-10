import { useState, useCallback } from "react";
import { TrialBalance } from "../types";
import { parseExcelFile } from "../utils/excel-parser";

export function useTrialBalance() {
  const [trialBalances, setTrialBalances] = useState<TrialBalance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addTrialBalance = useCallback(
    async (file: File, companyName?: string) => {
      setLoading(true);
      setError(null);

      try {
        const parsed = await parseExcelFile(file);

        // Override company name if provided
        if (companyName) {
          parsed.companyName = companyName;
        }

        setTrialBalances((prev) => {
          // Check if company already exists
          const existing = prev.findIndex(
            (tb) => tb.companyName === parsed.companyName
          );

          if (existing !== -1) {
            // Replace existing
            const updated = [...prev];
            updated[existing] = parsed;
            return updated;
          }

          // Add new (max 4)
          if (prev.length >= 4) {
            setError("Maximum 4 companies allowed");
            return prev;
          }

          return [...prev, parsed];
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to parse Excel file"
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const removeTrialBalance = useCallback((companyName: string) => {
    setTrialBalances((prev) =>
      prev.filter((tb) => tb.companyName !== companyName)
    );
  }, []);

  const clearAll = useCallback(() => {
    setTrialBalances([]);
    setError(null);
  }, []);

  const updateCompanyName = useCallback((oldName: string, newName: string) => {
    setTrialBalances((prev) =>
      prev.map((tb) =>
        tb.companyName === oldName ? { ...tb, companyName: newName } : tb
      )
    );
  }, []);

  return {
    trialBalances,
    loading,
    error,
    addTrialBalance,
    removeTrialBalance,
    clearAll,
    updateCompanyName,
  };
}
