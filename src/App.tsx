import { useState } from "react";
import { useTrialBalance } from "./hooks/useTrialBalance";
import { useConsolidation } from "./hooks/useConsolidation";
import { useExport } from "./hooks/useExport";
import FileUpload from "./components/FileUpload";
import TrialBalanceList from "./components/TrialBalanceList";
import { generateFinancialStatements } from "./utils/financial-statements";
import { formatCurrency } from "./utils/financial-statements";
import { AlertCircle, CheckCircle2, Download, FileDown } from "lucide-react";
import { format } from "date-fns";

type Step = "upload" | "mapping" | "consolidation" | "export";

export default function App() {
  const [currentStep, setCurrentStep] = useState<Step>("upload");

  const trialBalance = useTrialBalance();
  const consolidation = useConsolidation(trialBalance.trialBalances);
  const consolidated = consolidation.consolidate();
  const statements = consolidated ? generateFinancialStatements(consolidated) : null;
  const exportHook = useExport(consolidated);

  const handleInitializeMapping = () => {
    consolidation.initializeAutoMappings();
  };

  const handleDownloadExcel = async () => {
    if (statements) {
      await exportHook.downloadExcel(statements, consolidation.mappings);
    }
  };

  const handleDownloadPDF = async () => {
    await exportHook.downloadPDF("statements-view", "consolidated-statements.pdf");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Tally Consolidation Tool
          </h1>
          <p className="text-gray-600">
            Consolidate trial balances from multiple companies into unified financial statements
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8 flex gap-4">
          {[
            { step: "upload" as Step, label: "Upload" },
            { step: "mapping" as Step, label: "Mapping" },
            { step: "consolidation" as Step, label: "Consolidate" },
            { step: "export" as Step, label: "Export" },
          ].map((item, index) => (
            <div key={item.step} className="flex items-center gap-2">
              <button
                onClick={() => setCurrentStep(item.step)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentStep === item.step
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                {trialBalance.trialBalances.length > 0 && index < 3 && (
                  <CheckCircle2 size={18} />
                )}
                {item.label}
              </button>
              {index < 3 && <div className="w-2 h-2 rounded-full bg-gray-300" />}
            </div>
          ))}
        </div>

        {/* Step 1: Upload */}
        {currentStep === "upload" && (
          <div className="bg-white rounded-lg p-8 shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">
              Step 1: Upload Trial Balances
            </h2>
            <p className="text-gray-600 mb-6">
              Upload Excel files containing trial balance data from your 4 companies. Maximum 4 files.
            </p>

            <div className="space-y-6">
              <FileUpload
                onFileSelect={trialBalance.addTrialBalance}
                loading={trialBalance.loading}
                error={trialBalance.error}
                maxFiles={4}
                currentFiles={trialBalance.trialBalances.length}
              />

              {trialBalance.trialBalances.length > 0 && (
                <>
                  <div className="pt-6 border-t">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">
                      Uploaded Files ({trialBalance.trialBalances.length}/4)
                    </h3>
                    <TrialBalanceList
                      trialBalances={trialBalance.trialBalances}
                      onRemove={trialBalance.removeTrialBalance}
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    {trialBalance.trialBalances.length > 0 && (
                      <button
                        onClick={() => setCurrentStep("mapping")}
                        className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Continue to Mapping
                      </button>
                    )}
                    {trialBalance.trialBalances.length >= 2 && (
                      <button
                        onClick={trialBalance.clearAll}
                        className="px-6 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Mapping */}
        {currentStep === "mapping" && trialBalance.trialBalances.length > 0 && (
          <div className="bg-white rounded-lg p-8 shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">
              Step 2: Account Mapping
            </h2>
            <p className="text-gray-600 mb-6">
              Map accounts from your trial balances to a standard chart of accounts for consolidation.
            </p>

            {consolidation.autoMappings.size === 0 ? (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
                <p className="text-blue-800">
                  Auto-detection will identify common accounts across your trial balances.
                </p>
              </div>
            ) : (
              <div className="space-y-4 mb-6">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex gap-2">
                  <CheckCircle2 className="text-green-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-green-900">Auto-Detection Complete</p>
                    <p className="text-green-800">
                      Found {consolidation.autoMappings.size} account mappings
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Detected Mappings
                  </h3>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 font-semibold">Standard Account</th>
                        <th className="text-left py-2 font-semibold">Category</th>
                        <th className="text-left py-2 font-semibold">Mapped From</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from(consolidation.autoMappings.values()).map((mapping) => (
                        <tr key={mapping.id} className="border-b hover:bg-white">
                          <td className="py-2">{mapping.standardAccountName}</td>
                          <td className="py-2">{mapping.category}</td>
                          <td className="py-2 text-xs">
                            {mapping.mappedAccounts.map((m) => m.accountName).join(", ")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              {consolidation.autoMappings.size > 0 ? (
                <button
                  onClick={() => {
                    handleInitializeMapping();
                    setCurrentStep("consolidation");
                  }}
                  className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Use These Mappings
                </button>
              ) : (
                <button
                  onClick={handleInitializeMapping}
                  className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Auto-Detect Mappings
                </button>
              )}
              <button
                onClick={() => setCurrentStep("upload")}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Back
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Consolidation */}
        {currentStep === "consolidation" && consolidated && (
          <div className="bg-white rounded-lg p-8 shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">
              Step 3: Consolidated View
            </h2>

            {statements && (
              <div className="space-y-8">
                {/* Financial Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                    <p className="text-sm font-semibold text-blue-900 mb-2">
                      Total Assets
                    </p>
                    <p className="text-3xl font-bold text-blue-600">
                      {formatCurrency(statements.balanceSheet.totalAssets)}
                    </p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
                    <p className="text-sm font-semibold text-purple-900 mb-2">
                      Net Profit
                    </p>
                    <p className="text-3xl font-bold text-purple-600">
                      {formatCurrency(statements.incomeStatement.netProfit)}
                    </p>
                  </div>
                </div>

                {/* Trial Balance Preview */}
                <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Consolidated Trial Balance
                  </h3>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-100">
                        <th className="text-left py-2 px-2 font-semibold">Account</th>
                        <th className="text-right py-2 px-2 font-semibold">Consolidated</th>
                      </tr>
                    </thead>
                    <tbody>
                      {consolidated.accounts.slice(0, 20).map((acc) => (
                        <tr key={acc.standardAccountCode} className="border-b hover:bg-white">
                          <td className="py-2 px-2">{acc.standardAccountName}</td>
                          <td className="text-right py-2 px-2 font-mono">
                            {formatCurrency(acc.consolidated)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {consolidated.accounts.length > 20 && (
                    <p className="text-xs text-gray-500 mt-2">
                      ... and {consolidated.accounts.length - 20} more accounts
                    </p>
                  )}
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setCurrentStep("export")}
                    className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Export Results
                  </button>
                  <button
                    onClick={() => setCurrentStep("mapping")}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Back
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Export */}
        {currentStep === "export" && consolidated && statements && (
          <div className="bg-white rounded-lg p-8 shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">
              Step 4: Export Results
            </h2>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={handleDownloadExcel}
                  disabled={exportHook.loading}
                  className="flex items-center justify-center gap-3 p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 disabled:opacity-50"
                >
                  <FileDown className="text-blue-600" size={24} />
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">Export to Excel</p>
                    <p className="text-sm text-gray-600">Multiple sheets with all statements</p>
                  </div>
                </button>

                <button
                  onClick={handleDownloadPDF}
                  disabled={exportHook.loading}
                  className="flex items-center justify-center gap-3 p-4 border-2 border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50"
                >
                  <Download className="text-red-600" size={24} />
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">Export to PDF</p>
                    <p className="text-sm text-gray-600">Professional formatted report</p>
                  </div>
                </button>
              </div>

              {exportHook.error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-2">
                  <AlertCircle className="text-red-600 flex-shrink-0" />
                  <p className="text-red-700">{exportHook.error}</p>
                </div>
              )}

              {exportHook.loading && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-700">Generating export...</p>
                </div>
              )}

              <div className="border-t pt-6">
                <button
                  onClick={() => setCurrentStep("consolidation")}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Hidden element for PDF generation */}
        <div id="statements-view" className="hidden">
          {statements && (
            <div className="p-8 bg-white">
              <h1 className="text-2xl font-bold mb-4">Consolidated Financial Statements</h1>
              <p className="text-gray-600 mb-8">
                Period: {format(statements.period.from, "dd MMM yyyy")} to{" "}
                {format(statements.period.to, "dd MMM yyyy")}
              </p>

              <h2 className="text-xl font-bold mt-8 mb-4">Income Statement</h2>
              <table className="w-full mb-8">
                <tbody>
                  {statements.incomeStatement.revenue.map((item) => (
                    <tr key={item.account}>
                      <td>{item.account}</td>
                      <td className="text-right">{formatCurrency(item.consolidated)}</td>
                    </tr>
                  ))}
                  <tr className="font-bold border-t">
                    <td>Total Revenue</td>
                    <td className="text-right">{formatCurrency(statements.incomeStatement.totalRevenue)}</td>
                  </tr>
                  {statements.incomeStatement.expenses.map((item) => (
                    <tr key={item.account}>
                      <td>{item.account}</td>
                      <td className="text-right">{formatCurrency(item.consolidated)}</td>
                    </tr>
                  ))}
                  <tr className="font-bold border-t">
                    <td>Total Expenses</td>
                    <td className="text-right">{formatCurrency(statements.incomeStatement.totalExpenses)}</td>
                  </tr>
                  <tr className="font-bold text-lg">
                    <td>Net Profit</td>
                    <td className="text-right">{formatCurrency(statements.incomeStatement.netProfit)}</td>
                  </tr>
                </tbody>
              </table>

              <h2 className="text-xl font-bold mt-8 mb-4">Balance Sheet</h2>
              <table className="w-full">
                <tbody>
                  <tr className="font-bold">
                    <td>ASSETS</td>
                  </tr>
                  {statements.balanceSheet.assets.map((item) => (
                    <tr key={item.account}>
                      <td>{item.account}</td>
                      <td className="text-right">{formatCurrency(item.consolidated)}</td>
                    </tr>
                  ))}
                  <tr className="font-bold border-t">
                    <td>Total Assets</td>
                    <td className="text-right">{formatCurrency(statements.balanceSheet.totalAssets)}</td>
                  </tr>

                  <tr className="font-bold mt-4">
                    <td>LIABILITIES</td>
                  </tr>
                  {statements.balanceSheet.liabilities.map((item) => (
                    <tr key={item.account}>
                      <td>{item.account}</td>
                      <td className="text-right">{formatCurrency(item.consolidated)}</td>
                    </tr>
                  ))}
                  <tr className="font-bold border-t">
                    <td>Total Liabilities</td>
                    <td className="text-right">{formatCurrency(statements.balanceSheet.totalLiabilities)}</td>
                  </tr>

                  <tr className="font-bold">
                    <td>EQUITY</td>
                  </tr>
                  {statements.balanceSheet.equity.map((item) => (
                    <tr key={item.account}>
                      <td>{item.account}</td>
                      <td className="text-right">{formatCurrency(item.consolidated)}</td>
                    </tr>
                  ))}
                  <tr className="font-bold border-t">
                    <td>Total Equity</td>
                    <td className="text-right">{formatCurrency(statements.balanceSheet.totalEquity)}</td>
                  </tr>

                  <tr className="font-bold border-t text-lg">
                    <td>Total Liabilities + Equity</td>
                    <td className="text-right">
                      {formatCurrency(statements.balanceSheet.totalLiabilities + statements.balanceSheet.totalEquity)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
