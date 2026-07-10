import {
  TrialBalance,
  Account,
  AccountMapping,
  ConsolidatedTrialBalance,
  ConsolidatedAccount,
  EliminationEntry,
} from "../types";

export function consolidateTrialBalances(
  trialBalances: TrialBalance[],
  mappings: Map<string, AccountMapping>,
  eliminations: EliminationEntry[] = []
): ConsolidatedTrialBalance {
  // Flatten all accounts from all companies
  const allAccountsFlat: {
    company: string;
    account: Account;
  }[] = [];

  trialBalances.forEach((tb, index) => {
    const flattened = flattenAccounts(tb.accounts);
    flattened.forEach((acc) => {
      allAccountsFlat.push({
        company: `company${index + 1}`,
        account: acc,
      });
    });
  });

  // Group by standard account mapping
  const consolidatedMap = new Map<string, ConsolidatedAccount>();

  // Process all mappings
  mappings.forEach((mapping) => {
    const standardKey = mapping.id;
    const balances: Record<string, number> = {
      company1: 0,
      company2: 0,
      company3: 0,
      company4: 0,
    };

    // Find all accounts in this mapping and sum their closing balances
    mapping.mappedAccounts.forEach((mapped) => {
      const matching = allAccountsFlat.find(
        (a) =>
          a.account.name === mapped.accountName
      );

      if (matching) {
        const companyKey = mapped.company
          .toLowerCase()
          .replace(/\s+/g, "");
        const company1Key = Object.keys(balances)[0]; // company1, company2, etc.

        // Find the right company key
        trialBalances.forEach((tb, idx) => {
          if (tb.companyName === mapped.company) {
            balances[`company${idx + 1}`] += matching.account.closingBalance;
          }
        });
      }
    });

    const consolidated = Object.values(balances).reduce((sum, val) => sum + val, 0);

    consolidatedMap.set(standardKey, {
      standardAccountCode: mapping.standardAccountCode,
      standardAccountName: mapping.standardAccountName,
      category: mapping.category,
      balances,
      eliminations: 0,
      consolidated,
    });
  });

  // Apply eliminations
  let totalEliminations = 0;
  eliminations.forEach((elim) => {
    const debitAcc = consolidatedMap.values();
    const creditAcc = consolidatedMap.values();

    // Find and update elimination amounts
    consolidatedMap.forEach((acc) => {
      if (acc.standardAccountName === elim.debitAccount) {
        acc.eliminations -= elim.debitAmount;
        acc.consolidated -= elim.debitAmount;
        totalEliminations += elim.debitAmount;
      }
      if (acc.standardAccountName === elim.creditAccount) {
        acc.eliminations += elim.creditAmount;
        acc.consolidated += elim.creditAmount;
      }
    });
  });

  return {
    period: trialBalances[0].period,
    accounts: Array.from(consolidatedMap.values()),
    eliminations,
  };
}

export function flattenAccounts(accounts: Account[]): Account[] {
  const result: Account[] = [];
  accounts.forEach((account) => {
    result.push(account);
    if (account.children) {
      result.push(...flattenAccounts(account.children));
    }
  });
  return result;
}

export function detectIntercompanyAccounts(
  trialBalances: TrialBalance[]
): string[] {
  const intercoPatterns = [
    /inter\s*co(?:mpany)?/i,
    /loan\s*to/i,
    /loan\s*from/i,
    /due\s*to/i,
    /due\s*from/i,
    /kdi/i,
    /kreasi/i,
  ];

  const detected: string[] = [];
  const seen = new Set<string>();

  trialBalances.forEach((tb) => {
    const flattened = flattenAccounts(tb.accounts);
    flattened.forEach((acc) => {
      if (!seen.has(acc.name)) {
        intercoPatterns.forEach((pattern) => {
          if (pattern.test(acc.name)) {
            detected.push(acc.name);
            seen.add(acc.name);
          }
        });
      }
    });
  });

  return detected;
}

export function validateConsolidation(consolidated: ConsolidatedTrialBalance): {
  isValid: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];

  // Check if total debits equals total credits
  let totalDebits = 0;
  let totalCredits = 0;

  consolidated.accounts.forEach((acc) => {
    if (acc.category === "Asset" || acc.category === "Expense") {
      totalDebits += Math.max(0, acc.consolidated);
    }
    if (acc.category === "Liability" || acc.category === "Equity" || acc.category === "Revenue") {
      totalCredits += Math.max(0, acc.consolidated);
    }
  });

  const difference = Math.abs(totalDebits - totalCredits);
  if (difference > 0.01) {
    warnings.push(
      `Trial balance does not balance. Difference: ${difference.toFixed(2)}`
    );
  }

  // Check for missing mappings
  const mappedAccounts = new Set<string>();
  consolidated.accounts.forEach((acc) => {
    mappedAccounts.add(acc.standardAccountName);
  });

  if (mappedAccounts.size === 0) {
    warnings.push("No accounts have been mapped for consolidation");
  }

  return {
    isValid: warnings.length === 0,
    warnings,
  };
}

export function getAccountsByCategory(
  consolidated: ConsolidatedTrialBalance,
  category: string
): ConsolidatedAccount[] {
  return consolidated.accounts.filter((acc) => acc.category === category);
}

export function calculateTotals(consolidated: ConsolidatedTrialBalance): {
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  netProfit: number;
} {
  let totalAssets = 0;
  let totalLiabilities = 0;
  let totalEquity = 0;
  let totalRevenue = 0;
  let totalExpenses = 0;

  consolidated.accounts.forEach((acc) => {
    if (acc.category === "Asset") {
      totalAssets += acc.consolidated;
    } else if (acc.category === "Liability") {
      totalLiabilities += acc.consolidated;
    } else if (acc.category === "Equity") {
      totalEquity += acc.consolidated;
    } else if (acc.category === "Revenue") {
      totalRevenue += acc.consolidated;
    } else if (acc.category === "Expense") {
      totalExpenses += acc.consolidated;
    }
  });

  return {
    totalAssets: Math.abs(totalAssets),
    totalLiabilities: Math.abs(totalLiabilities),
    totalEquity: Math.abs(totalEquity),
    netProfit: totalRevenue - totalExpenses,
  };
}
