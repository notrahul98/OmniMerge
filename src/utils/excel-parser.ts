import * as XLSX from "xlsx";
import { TrialBalance, Account } from "../types";

interface RawRow {
  [key: string]: string | number | undefined;
}

export async function parseExcelFile(file: File): Promise<TrialBalance> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { header: 1 });

  if (!workbook.SheetNames.length) {
    throw new Error("Excel file contains no sheets");
  }

  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json<RawRow>(sheet, { defval: "" });

  if (data.length < 2) {
    throw new Error("Excel file does not contain enough data");
  }

  // Extract company name and period from header rows
  const rawData = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 }) as string[][];
  const companyName = extractCompanyName(rawData);
  const period = extractPeriod(rawData);

  // Parse accounts from data rows
  const accounts = parseAccounts(data);

  return {
    companyName,
    period,
    accounts,
  };
}

function extractCompanyName(rawData: string[][]): string {
  // Look for company name in first few rows
  for (let i = 0; i < Math.min(5, rawData.length); i++) {
    const row = rawData[i];
    if (row && row[0] && typeof row[0] === "string" && row[0].length > 0) {
      // Check if it looks like a company name (has letters, not just numbers)
      if (!/^(Trial|Balance|Particulars|Opening|Debit|Credit|Closing)/.test(row[0])) {
        return row[0].trim();
      }
    }
  }
  return "Unknown Company";
}

function extractPeriod(rawData: string[][]): { from: Date; to: Date } {
  const now = new Date();
  const defaultFrom = new Date(now.getFullYear(), now.getMonth(), 1);
  const defaultTo = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  // Look for date pattern in first 10 rows
  for (let i = 0; i < Math.min(10, rawData.length); i++) {
    const row = rawData[i];
    if (row) {
      const rowText = row.join(" ");
      const dateMatch = rowText.match(/(\d{1,2})-(\w+)-(\d{2,4})/g);
      if (dateMatch && dateMatch.length >= 2) {
        try {
          const from = parseDate(dateMatch[0]);
          const to = parseDate(dateMatch[1]);
          if (from && to) {
            return { from, to };
          }
        } catch (e) {
          // Continue to next row
        }
      }
    }
  }

  return { from: defaultFrom, to: defaultTo };
}

function parseDate(dateStr: string): Date | null {
  const match = dateStr.match(/(\d{1,2})-(\w+)-(\d{2,4})/);
  if (!match) return null;

  const day = parseInt(match[1], 10);
  const monthStr = match[2];
  const year = parseInt(match[3], 10);

  const months: { [key: string]: number } = {
    Jan: 0,
    Feb: 1,
    Mar: 2,
    Apr: 3,
    May: 4,
    Jun: 5,
    Jul: 6,
    Aug: 7,
    Sep: 8,
    Oct: 9,
    Nov: 10,
    Dec: 11,
  };

  const month = months[monthStr.substring(0, 3)];
  if (month === undefined) return null;

  const fullYear = year < 100 ? (year > 50 ? 1900 + year : 2000 + year) : year;
  return new Date(fullYear, month, day);
}

function parseAccounts(data: RawRow[]): Account[] {
  const accounts: Account[] = [];

  data.forEach((row, index) => {
    // Skip empty rows
    if (
      !row.Particulars &&
      !row["Account Name"] &&
      !row.Account &&
      !row.name
    ) {
      return;
    }

    const accountName =
      (row.Particulars as string) ||
      (row["Account Name"] as string) ||
      (row.Account as string) ||
      (row.name as string) ||
      "";

    if (!accountName || accountName.trim().length === 0) {
      return;
    }

    const opening =
      parseNumber(row["Opening Balance"] || row.Opening || row["Opening Bl."]) || 0;
    const debit =
      parseNumber(
        row.Debit ||
          row["Debit Transactions"] ||
          row["Debit Amt"] ||
          row.Dr
      ) || 0;
    const credit =
      parseNumber(
        row.Credit ||
          row["Credit Transactions"] ||
          row["Credit Amt"] ||
          row.Cr
      ) || 0;
    const closing =
      parseNumber(row["Closing Balance"] || row.Closing || row["Closing Bl."]) || 0;

    const account: Account = {
      accountId: `acc_${index}`,
      name: accountName.trim(),
      category: inferCategory(accountName),
      openingBalance: opening,
      debitTransactions: debit,
      creditTransactions: credit,
      closingBalance: closing,
      level: inferLevel(accountName),
    };

    accounts.push(account);
  });

  return buildHierarchy(accounts);
}

function parseNumber(value: unknown): number {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    // Remove currency symbols and spaces
    const cleaned = value
      .replace(/[A-Za-z\s]/g, "")
      .replace(/,/g, "")
      .trim();

    if (cleaned.length === 0) return 0;

    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  }

  return 0;
}

function inferCategory(
  accountName: string
): "Asset" | "Liability" | "Equity" | "Revenue" | "Expense" | "Other" {
  const name = accountName.toLowerCase();

  if (
    name.includes("capital") ||
    name.includes("equity") ||
    name.includes("retained") ||
    name.includes("share")
  ) {
    return "Equity";
  }

  if (
    name.includes("loan") ||
    name.includes("creditor") ||
    name.includes("payable") ||
    name.includes("liability")
  ) {
    return "Liability";
  }

  if (
    name.includes("asset") ||
    name.includes("bank") ||
    name.includes("cash") ||
    name.includes("stock") ||
    name.includes("advance") ||
    name.includes("receivable") ||
    name.includes("deposit")
  ) {
    return "Asset";
  }

  if (
    name.includes("sale") ||
    name.includes("revenue") ||
    name.includes("income") ||
    name.includes("fee")
  ) {
    return "Revenue";
  }

  if (
    name.includes("expense") ||
    name.includes("cost") ||
    name.includes("tax") ||
    name.includes("fee") ||
    name.includes("admin")
  ) {
    return "Expense";
  }

  return "Other";
}

function inferLevel(accountName: string): number {
  // Based on indentation or naming patterns
  if (accountName.startsWith("  ")) return 2;
  if (accountName.startsWith(" ")) return 1;
  // Check if it's a parent account (like "Current Assets", "Loans", etc.)
  if (/(^[A-Z][a-z]+\s+[A-Z]|Account|Total|Current|Non-Current)/.test(accountName)) {
    return 1;
  }
  return 2;
}

function buildHierarchy(accounts: Account[]): Account[] {
  // Create a map of parent accounts and their children
  const hierarchy: Account[] = [];
  const parents = new Map<string, Account>();

  accounts.forEach((account) => {
    if (account.level === 1) {
      parents.set(account.name, { ...account, children: [] });
    }
  });

  accounts.forEach((account) => {
    if (account.level === 1) {
      const parent = parents.get(account.name);
      if (parent) {
        hierarchy.push(parent);
      }
    } else if (account.level === 2) {
      // Try to find parent based on similar category
      let parentFound = false;
      parents.forEach((parent) => {
        if (parent.children && parent.category === account.category) {
          parent.children.push(account);
          parentFound = true;
        }
      });
      if (!parentFound) {
        hierarchy.push(account);
      }
    }
  });

  return hierarchy.length > 0 ? hierarchy : accounts;
}
