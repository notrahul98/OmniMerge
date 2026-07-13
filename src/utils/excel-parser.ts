import * as XLSX from "xlsx";
import { TrialBalance, Account } from "../types";

type RawCell = string | number | undefined;

export async function parseExcelFile(file: File): Promise<TrialBalance> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer);

  if (!workbook.SheetNames.length) {
    throw new Error("Excel file contains no sheets");
  }

  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawData = XLSX.utils.sheet_to_json<RawCell[]>(sheet, {
    header: 1,
    defval: "",
  });

  if (rawData.length < 2) {
    throw new Error("Excel file does not contain enough data");
  }

  const companyName = extractCompanyName(rawData);
  const period = extractPeriod(rawData);
  const accounts = parseAccounts(rawData);

  if (accounts.length === 0) {
    throw new Error(
      "Could not find any account rows. Make sure the sheet has a 'Particulars' column with account names."
    );
  }

  return {
    companyName,
    period,
    accounts,
  };
}

function extractCompanyName(rawData: RawCell[][]): string {
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

function extractPeriod(rawData: RawCell[][]): { from: Date; to: Date } {
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
        const from = parseDate(dateMatch[0]);
        const to = parseDate(dateMatch[1]);
        if (from && to) {
          return { from, to };
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

/**
 * Tally trial balance exports have several title rows (company name, period,
 * repeated company/period) before the real column header row, and the header
 * itself is often split across two rows via merged cells (e.g. "Opening" on
 * one row, "Balance" directly below it). sheet_to_json's default "first row
 * is the header" behavior can't handle that, so we locate the "Particulars"
 * label ourselves and read data by fixed column position from there.
 */
function findDataStartRow(rawData: RawCell[][]): number {
  let headerRowIndex = -1;

  for (let i = 0; i < rawData.length; i++) {
    const row = rawData[i];
    if (
      row?.some(
        (cell) => typeof cell === "string" && cell.trim().toLowerCase() === "particulars"
      )
    ) {
      headerRowIndex = i;
      break;
    }
  }

  if (headerRowIndex === -1) {
    // No recognizable header found; assume there is no title-row preamble.
    return 0;
  }

  let dataStart = headerRowIndex + 1;
  // Skip any secondary header row(s) (e.g. "Balance | Debit | Credit | Balance")
  // which are identifiable by having no value in the Particulars column.
  while (
    dataStart < rawData.length &&
    (rawData[dataStart]?.[0] === undefined ||
      String(rawData[dataStart][0]).trim().length === 0)
  ) {
    dataStart++;
  }

  return dataStart;
}

function parseAccounts(rawData: RawCell[][]): Account[] {
  const accounts: Account[] = [];
  const dataStart = findDataStartRow(rawData);

  for (let i = dataStart; i < rawData.length; i++) {
    const row = rawData[i];
    if (!row) continue;

    const rawName = row[0];
    const accountName = typeof rawName === "string" ? rawName.trim() : "";

    if (!accountName) {
      continue;
    }

    const opening = parseNumber(row[1]);
    const debit = parseNumber(row[2]);
    const credit = parseNumber(row[3]);
    const closing = parseNumber(row[4]);

    accounts.push({
      accountId: `acc_${i}`,
      name: accountName,
      category: inferCategory(accountName),
      openingBalance: opening,
      debitTransactions: debit,
      creditTransactions: credit,
      closingBalance: closing,
      level: inferLevel(String(rawName ?? "")),
    });
  }

  return buildHierarchy(accounts);
}

function parseNumber(value: unknown): number {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    // Remove currency symbols/letters (e.g. trailing "Dr"/"Cr") and thousands separators
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
    name.includes("liabilit") // matches both "liability" and "liabilities"
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
