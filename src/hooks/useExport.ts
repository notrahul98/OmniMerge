import { useState, useCallback } from "react";
import {
  ConsolidatedTrialBalance,
  FinancialStatements,
  AccountMapping,
} from "../types";
import { exportToExcel, exportToPDF } from "../utils/export";
import { generateFinancialStatements } from "../utils/financial-statements";

export function useExport(consolidated: ConsolidatedTrialBalance | null) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateStatements = useCallback((): FinancialStatements | null => {
    if (!consolidated) {
      setError("No consolidated data to generate statements");
      return null;
    }

    try {
      return generateFinancialStatements(consolidated);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to generate financial statements"
      );
      return null;
    }
  }, [consolidated]);

  const downloadExcel = useCallback(
    async (
      statements: FinancialStatements,
      mappings: Map<string, AccountMapping>
    ) => {
      if (!consolidated) {
        setError("No consolidated data to export");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        await exportToExcel(consolidated, statements, mappings);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to export to Excel"
        );
      } finally {
        setLoading(false);
      }
    },
    [consolidated]
  );

  const downloadPDF = useCallback(
    async (elementId: string, filename?: string) => {
      setLoading(true);
      setError(null);

      try {
        const element = document.getElementById(elementId);
        if (!element) {
          setError("Element not found for PDF export");
          return;
        }

        await exportToPDF(
          element,
          filename || "consolidated-statements.pdf"
        );
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to export to PDF"
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    error,
    generateStatements,
    downloadExcel,
    downloadPDF,
  };
}
