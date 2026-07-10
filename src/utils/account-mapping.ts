import { Account, AccountMapping, TrialBalance } from "../types";

// Standard chart of accounts that we map everything to
const STANDARD_ACCOUNTS: AccountMapping[] = [
  // Capital/Equity
  {
    id: "eq_capital",
    standardAccountCode: "EQ001",
    standardAccountName: "Share Capital",
    category: "Equity",
    mappedAccounts: [],
  },
  {
    id: "eq_retained",
    standardAccountCode: "EQ002",
    standardAccountName: "Retained Earnings",
    category: "Equity",
    mappedAccounts: [],
  },
  // Loans
  {
    id: "liab_loans",
    standardAccountCode: "LIB001",
    standardAccountName: "Long-term Loans",
    category: "Liability",
    mappedAccounts: [],
  },
  {
    id: "liab_shareholder_loan",
    standardAccountCode: "LIB002",
    standardAccountName: "Shareholder Loans",
    category: "Liability",
    mappedAccounts: [],
  },
  // Current Liabilities
  {
    id: "liab_current",
    standardAccountCode: "LIB003",
    standardAccountName: "Current Liabilities",
    category: "Liability",
    mappedAccounts: [],
  },
  {
    id: "liab_creditors",
    standardAccountCode: "LIB004",
    standardAccountName: "Sundry Creditors",
    category: "Liability",
    mappedAccounts: [],
  },
  {
    id: "liab_tax",
    standardAccountCode: "LIB005",
    standardAccountName: "Tax Payable",
    category: "Liability",
    mappedAccounts: [],
  },
  // Current Assets
  {
    id: "asset_current",
    standardAccountCode: "AST001",
    standardAccountName: "Current Assets",
    category: "Asset",
    mappedAccounts: [],
  },
  {
    id: "asset_bank",
    standardAccountCode: "AST002",
    standardAccountName: "Bank Accounts",
    category: "Asset",
    mappedAccounts: [],
  },
  {
    id: "asset_cash",
    standardAccountCode: "AST003",
    standardAccountName: "Cash",
    category: "Asset",
    mappedAccounts: [],
  },
  {
    id: "asset_stock",
    standardAccountCode: "AST004",
    standardAccountName: "Inventory/Stock",
    category: "Asset",
    mappedAccounts: [],
  },
  {
    id: "asset_receivables",
    standardAccountCode: "AST005",
    standardAccountName: "Sundry Debtors/Receivables",
    category: "Asset",
    mappedAccounts: [],
  },
  {
    id: "asset_advances",
    standardAccountCode: "AST006",
    standardAccountName: "Advances",
    category: "Asset",
    mappedAccounts: [],
  },
  {
    id: "asset_prepaid",
    standardAccountCode: "AST007",
    standardAccountName: "Prepaid Expenses",
    category: "Asset",
    mappedAccounts: [],
  },
  {
    id: "asset_interco",
    standardAccountCode: "AST008",
    standardAccountName: "Intercompany Receivables",
    category: "Asset",
    mappedAccounts: [],
  },
  // Revenue
  {
    id: "rev_sales",
    standardAccountCode: "REV001",
    standardAccountName: "Sales Revenue",
    category: "Revenue",
    mappedAccounts: [],
  },
  {
    id: "rev_interco",
    standardAccountCode: "REV002",
    standardAccountName: "Intercompany Sales",
    category: "Revenue",
    mappedAccounts: [],
  },
  // Expenses
  {
    id: "exp_cogs",
    standardAccountCode: "EXP001",
    standardAccountName: "Cost of Goods Sold",
    category: "Expense",
    mappedAccounts: [],
  },
  {
    id: "exp_admin",
    standardAccountCode: "EXP002",
    standardAccountName: "Admin Expenses",
    category: "Expense",
    mappedAccounts: [],
  },
  {
    id: "exp_tax",
    standardAccountCode: "EXP003",
    standardAccountName: "Tax Expenses",
    category: "Expense",
    mappedAccounts: [],
  },
];

export function autoDetectMappings(
  trialBalances: TrialBalance[]
): Map<string, AccountMapping> {
  const mappingMap = new Map<string, AccountMapping>();

  // Initialize with standard accounts
  STANDARD_ACCOUNTS.forEach((acc) => {
    mappingMap.set(acc.id, { ...acc });
  });

  // Extract all accounts from all companies
  const allAccounts: { company: string; account: Account }[] = [];
  trialBalances.forEach((tb) => {
    flattenAccounts(tb.accounts).forEach((acc) => {
      allAccounts.push({ company: tb.companyName, account: acc });
    });
  });

  // Match accounts to standard accounts
  allAccounts.forEach(({ company, account }) => {
    const bestMatch = findBestMatch(account, mappingMap);
    if (bestMatch) {
      const mapping = mappingMap.get(bestMatch.id)!;
      if (
        !mapping.mappedAccounts.some(
          (m) => m.company === company && m.accountName === account.name
        )
      ) {
        mapping.mappedAccounts.push({
          company,
          accountName: account.name,
          accountId: account.accountId,
        });
      }
    }
  });

  // Remove empty mappings
  mappingMap.forEach((value, key) => {
    if (value.mappedAccounts.length === 0) {
      mappingMap.delete(key);
    }
  });

  return mappingMap;
}

function findBestMatch(
  account: Account,
  mappingMap: Map<string, AccountMapping>
): AccountMapping | null {
  let bestMatch: AccountMapping | null = null;
  let bestScore = 0;

  const accountNameLower = account.name.toLowerCase();

  mappingMap.forEach((mapping) => {
    if (mapping.category !== account.category) return;

    const score = calculateSimilarity(
      accountNameLower,
      mapping.standardAccountName.toLowerCase()
    );

    if (score > bestScore) {
      bestScore = score;
      bestMatch = mapping;
    }
  });

  // Only return match if score is reasonably high
  return bestScore > 0.3 ? bestMatch : null;
}

function calculateSimilarity(str1: string, str2: string): number {
  // Simple word-based similarity
  const words1 = str1.split(/[\s\W]+/).filter(Boolean);
  const words2 = str2.split(/[\s\W]+/).filter(Boolean);

  let matches = 0;
  words1.forEach((word) => {
    if (words2.some((w) => w.includes(word) || word.includes(w))) {
      matches++;
    }
  });

  const total = Math.max(words1.length, words2.length);
  return total === 0 ? 0 : matches / total;
}

function flattenAccounts(accounts: Account[]): Account[] {
  const result: Account[] = [];
  accounts.forEach((account) => {
    result.push(account);
    if (account.children) {
      result.push(...flattenAccounts(account.children));
    }
  });
  return result;
}

export function saveMapping(
  mappings: AccountMapping[],
  name: string
): void {
  const saved = {
    id: `mapping_${Date.now()}`,
    name,
    createdAt: new Date(),
    mappings,
  };

  const existing = JSON.parse(
    localStorage.getItem("saved_mappings") || "[]"
  );
  existing.push(saved);
  localStorage.setItem("saved_mappings", JSON.stringify(existing));
}

export function loadSavedMappings(): Array<{
  id: string;
  name: string;
  createdAt: string;
}> {
  const saved = JSON.parse(localStorage.getItem("saved_mappings") || "[]");
  return saved;
}

export function loadMapping(id: string): AccountMapping[] | null {
  const saved = JSON.parse(localStorage.getItem("saved_mappings") || "[]");
  const found = saved.find((m: any) => m.id === id);
  return found ? found.mappings : null;
}

export function deleteSavedMapping(id: string): void {
  const saved = JSON.parse(localStorage.getItem("saved_mappings") || "[]");
  const filtered = saved.filter((m: any) => m.id !== id);
  localStorage.setItem("saved_mappings", JSON.stringify(filtered));
}
