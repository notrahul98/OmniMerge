export interface Account {
  accountId: string;
  name: string;
  category: "Asset" | "Liability" | "Equity" | "Revenue" | "Expense" | "Other";
  openingBalance: number;
  debitTransactions: number;
  creditTransactions: number;
  closingBalance: number;
  children?: Account[];
  level?: number; // Hierarchy level (0 = root, 1 = parent, etc.)
}

export interface TrialBalance {
  companyName: string;
  period: {
    from: Date;
    to: Date;
  };
  accounts: Account[];
}

export interface AccountMapping {
  id: string;
  standardAccountCode: string;
  standardAccountName: string;
  category: string;
  mappedAccounts: {
    company: string;
    accountName: string;
    accountId?: string;
  }[];
}

export interface ConsolidatedAccount {
  standardAccountCode: string;
  standardAccountName: string;
  category: string;
  balances: {
    company1: number;
    company2: number;
    company3: number;
    company4: number;
  };
  eliminations: number;
  consolidated: number;
}

export interface ConsolidatedTrialBalance {
  period: {
    from: Date;
    to: Date;
  };
  accounts: ConsolidatedAccount[];
  eliminations: EliminationEntry[];
}

export interface EliminationEntry {
  id: string;
  debitAccount: string;
  creditAccount: string;
  debitAmount: number;
  creditAmount: number;
  description: string;
}

export interface FinancialStatements {
  period: {
    from: Date;
    to: Date;
  };
  incomeStatement: IncomeStatement;
  balanceSheet: BalanceSheet;
  notes: string[];
}

export interface IncomeStatement {
  revenue: {
    account: string;
    balances: Record<string, number>;
    consolidated: number;
  }[];
  totalRevenue: number;
  expenses: {
    account: string;
    balances: Record<string, number>;
    consolidated: number;
  }[];
  totalExpenses: number;
  netProfit: number;
}

export interface BalanceSheet {
  assets: {
    account: string;
    balances: Record<string, number>;
    consolidated: number;
  }[];
  totalAssets: number;
  liabilities: {
    account: string;
    balances: Record<string, number>;
    consolidated: number;
  }[];
  totalLiabilities: number;
  equity: {
    account: string;
    balances: Record<string, number>;
    consolidated: number;
  }[];
  totalEquity: number;
}

export interface SavedMapping {
  id: string;
  name: string;
  createdAt: Date;
  mappings: AccountMapping[];
}
