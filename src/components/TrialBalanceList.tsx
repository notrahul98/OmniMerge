import React from "react";
import { TrialBalance } from "../types";
import { Trash2, FileText } from "lucide-react";
import { format } from "date-fns";

interface TrialBalanceListProps {
  trialBalances: TrialBalance[];
  onRemove: (companyName: string) => void;
}

export default function TrialBalanceList({
  trialBalances,
  onRemove,
}: TrialBalanceListProps) {
  if (trialBalances.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No trial balances uploaded yet
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {trialBalances.map((tb) => (
        <div
          key={tb.companyName}
          className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <FileText className="text-blue-500 flex-shrink-0" size={20} />
              <div>
                <h3 className="font-semibold text-gray-900">{tb.companyName}</h3>
                <p className="text-sm text-gray-600">
                  {format(tb.period.from, "dd MMM yyyy")} to{" "}
                  {format(tb.period.to, "dd MMM yyyy")}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {tb.accounts.length} accounts
                </p>
              </div>
            </div>
            <button
              onClick={() => onRemove(tb.companyName)}
              className="text-red-500 hover:text-red-700 p-2"
              title="Remove"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
