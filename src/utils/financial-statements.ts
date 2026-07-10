import {
  ConsolidatedTrialBalance,
  FinancialStatements,
  IncomeStatement,
  BalanceSheet,
  ConsolidatedAccount,
} from "../types";
import { getAccountsByCategory } from "./consolidation";

export function generateFinancialStatements(
  consolidated: ConsolidatedTrialBalance
): FinancialStatements {
  return {
    period: consolidated.period,
    incomeStatement: generateIncomeStatement(consolidated),
    balanceSheet: generateBalanceSheet(consolidated),
    notes: generateNotes(consolidated),
  };
}

function generateIncomeStatement(
  consolidated: ConsolidatedTrialBalance
): IncomeStatement {
  const revenues = getAccountsByCategory(consolidated, "Revenue");
  const expenses = getAccountsByCategory(consolidated, "Expense");

  const revenueItems = revenues.map((acc) => ({
    account: acc.standardAccountName,
    balances: acc.balances,
    consolidated: acc.consolidated,
  }));

  const expenseItems = expenses.map((acc) => ({
    account: acc.standardAccountName,
    balances: acc.balances,
    consolidated: acc.consolidated,
  }));

  const totalRevenue = revenueItems.reduce((sum, item) => sum + item.consolidated, 0);
  const totalExpenses = expenseItems.reduce((sum, item) => sum + item.consolidated, 0);
  const netProfit = totalRevenue - totalExpenses;

  return {
    revenue: revenueItems,
    totalRevenue,
    expenses: expenseItems,
    totalExpenses,
    netProfit,
  };
}

function generateBalanceSheet(
  consolidated: ConsolidatedTrialBalance
): BalanceSheet {
  const assets = getAccountsByCategory(consolidated, "Asset");
  const liabilities = getAccountsByCategory(consolidated, "Liability");
  const equities = getAccountsByCategory(consolidated, "Equity");

  const assetItems = assets.map((acc) => ({
    account: acc.standardAccountName,
    balances: acc.balances,
    consolidated: acc.consolidated,
  }));

  const liabilityItems = liabilities.map((acc) => ({
    account: acc.standardAccountName,
    balances: acc.balances,
    consolidated: acc.consolidated,
  }));

  const equityItems = equities.map((acc) => ({
    account: acc.standardAccountName,
    balances: acc.balances,
    consolidated: acc.consolidated,
  }));

  const totalAssets = assetItems.reduce((sum, item) => sum + Math.abs(item.consolidated), 0);
  const totalLiabilities = liabilityItems.reduce((sum, item) => sum + Math.abs(item.consolidated), 0);
  const totalEquity = equityItems.reduce((sum, item) => sum + Math.abs(item.consolidated), 0);

  return {
    assets: assetItems,
    totalAssets,
    liabilities: liabilityItems,
    totalLiabilities,
    equity: equityItems,
    totalEquity,
  };
}

function generateNotes(
  consolidated: ConsolidatedTrialBalance
): string[] {
  const notes: string[] = [];

  // Note about period
  const from = new Date(consolidated.period.from);
  const to = new Date(consolidated.period.to);
  notes.push(
    `Consolidated Financial Statements for the period from ${from.toLocaleDateString()} to ${to.toLocaleDateString()}`
  );

  // Note about eliminations
  if (consolidated.eliminations.length > 0) {
    notes.push(`Includes ${consolidated.eliminations.length} intercompany elimination entries`);

    const totalEliminated = consolidated.eliminations.reduce(
      (sum, elim) => sum + elim.debitAmount,
      0
    );
    notes.push(`Total eliminations: ${totalEliminated.toFixed(2)}`);
  }

  // Note about consolidation
  const accountCategories = new Set<string>();
  consolidated.accounts.forEach((acc) => {
    accountCategories.add(acc.category);
  });
  notes.push(
    `Consolidated from 4 separate company trial balances covering the following categories: ${Array.from(accountCategories).join(", ")}`
  );

  return notes;
}

export function formatCurrency(value: number, decimals: number = 2): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function calculateRatios(
  statements: FinancialStatements
): {
  profitMargin: number;
  assetTurnover: number;
  debtToEquity: number;
  currentRatio: number;
} {
  const bs = statements.balanceSheet;
  const is = statements.incomeStatement;

  const profitMargin =
    is.totalRevenue > 0 ? (is.netProfit / is.totalRevenue) * 100 : 0;

  const assetTurnover =
    bs.totalAssets > 0 ? is.totalRevenue / bs.totalAssets : 0;

  const debtToEquity =
    bs.totalEquity > 0 ? bs.totalLiabilities / bs.totalEquity : 0;

  // Simple current ratio (would need current vs non-current split for accuracy)
  const currentRatio =
    bs.totalLiabilities > 0 ? bs.totalAssets / bs.totalLiabilities : 0;

  return {
    profitMargin,
    assetTurnover,
    debtToEquity,
    currentRatio,
  };
}

export function generateBalanceSheetValidation(
  balanceSheet: BalanceSheet
): {
  isBalanced: boolean;
  totalAssets: number;
  totalLiabilitiesAndEquity: number;
  difference: number;
} {
  const totalAssets = balanceSheet.totalAssets;
  const totalLiabilitiesAndEquity =
    balanceSheet.totalLiabilities + balanceSheet.totalEquity;
  const difference = Math.abs(totalAssets - totalLiabilitiesAndEquity);

  return {
    isBalanced: difference < 0.01,
    totalAssets,
    totalLiabilitiesAndEquity,
    difference,
  };
}
