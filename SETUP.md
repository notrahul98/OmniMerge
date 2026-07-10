# Tally Consolidation Tool - Setup Guide

## ✅ What's Been Built

A complete, production-ready **offline consolidation tool** with:

- ✅ React TypeScript frontend with Tailwind CSS + Radix UI
- ✅ Multi-step workflow UI (Upload → Mapping → Consolidate → Export)
- ✅ Excel parser (handles hierarchical accounts, Indonesian Rupiah format)
- ✅ Auto-detection algorithm for account mappings
- ✅ Consolidation engine with elimination entry support
- ✅ Financial statements generator (P&L + Balance Sheet)
- ✅ Excel export (multi-sheet workbook)
- ✅ PDF export (professional formatted reports)
- ✅ localStorage persistence for account mappings
- ✅ 100% client-side (no backend, no data sharing)

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** (or available in your environment)
- **npm** or **pnpm**
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation & Running

```bash
# Navigate to the project
cd artifacts/consolidation-tool

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at: **`http://localhost:5173`**

### Building for Production

```bash
# Build optimized bundle
npm run build

# Preview production build locally
npm run serve
```

## 📋 Project Structure

```
consolidation-tool/
├── src/
│   ├── components/           # React UI components
│   │   ├── FileUpload.tsx
│   │   └── TrialBalanceList.tsx
│   ├── hooks/               # Custom React hooks
│   │   ├── useTrialBalance.ts
│   │   ├── useConsolidation.ts
│   │   └── useExport.ts
│   ├── types/               # TypeScript interfaces
│   │   └── index.ts
│   ├── utils/               # Core business logic
│   │   ├── excel-parser.ts
│   │   ├── account-mapping.ts
│   │   ├── consolidation.ts
│   │   ├── financial-statements.ts
│   │   └── export.ts
│   ├── App.tsx              # Main component with workflow
│   ├── main.tsx             # React entry point
│   └── index.css            # Tailwind styles
├── index.html               # HTML template
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript config
├── vite.config.ts           # Vite build config
├── tailwind.config.ts       # Tailwind config
├── README.md                # User guide
└── SETUP.md                 # This file
```

## 📊 How to Use the Tool

### Step 1: Upload Trial Balances
1. Click **Upload Trial Balance**
2. Select 4 Excel/CSV files from your companies
3. System auto-extracts:
   - Company name
   - Period dates
   - Account hierarchy
   - Account balances

**Supported file formats:** `.xlsx`, `.csv`, `.xls`

### Step 2: Account Mapping
1. Click **"Auto-Detect Mappings"**
2. System analyzes accounts and suggests standard mappings
3. Review the detected mappings (shown in a table)
4. Click **"Use These Mappings"** to confirm

**Note:** Mappings are saved to browser localStorage automatically

### Step 3: Consolidation
1. System consolidates all 4 trial balances
2. Shows consolidated trial balance with company-by-company breakdown
3. Displays summary cards:
   - Total Assets
   - Net Profit

### Step 4: Export
Choose export format:
- **Excel**: Multi-sheet workbook with TB, P&L, Balance Sheet, Mapping Log
- **PDF**: Professional formatted financial statements

## 🔧 Key Features Explained

### Auto-Detection Algorithm
Matches account names across companies by:
- Category matching (e.g., all "Capital" accounts)
- Similarity scoring based on keywords
- Hierarchical level detection

### Account Categories
The tool recognizes:
- **Asset** - Bank, Cash, Stock, Receivables, Advances, Intercompany
- **Liability** - Loans, Creditors, Tax Payable, Current Liabilities
- **Equity** - Capital, Retained Earnings
- **Revenue** - Sales, Intercompany Sales
- **Expense** - COGS, Admin, Tax

### Consolidation Logic
1. Flattens hierarchical accounts from each company
2. Maps accounts using configured mappings
3. Sums closing balances across companies
4. Applies manual eliminations (if configured)
5. Generates consolidated figures

### Financial Statements
**Income Statement:**
- Revenue items (sum by category)
- Expense items (sum by category)
- Net Profit (Revenue - Expenses)

**Balance Sheet:**
- Assets (total)
- Liabilities (total)
- Equity (total)
- Validation: Assets = Liabilities + Equity

## 💾 Data Storage

### What Gets Saved
- **Account Mappings** → Browser localStorage (persistent across sessions)
- **Trial Balance Data** → In-memory only (not persisted)
- **Consolidated Results** → In-memory only (export to get permanent copy)

### Privacy
✅ No server communication
✅ No external API calls
✅ No analytics/tracking
✅ No cookies
✅ Works 100% offline

## 📝 Excel File Format

Your Tally Excel exports should have these columns:

```
Particulars | Opening Balance | Debit | Credit | Closing Balance
Company Name
Period: 1-Jun-26 to 30-Jun-26
Capital Account     | 1,000,000 | 0      | 0      | 1,000,000
  Mr. Deepak       |   400,000 | 0      | 0      |   400,000
Loans              |11,115,720 | 0      | 0      |11,115,720
Current Assets     | 3,805,363 | 50,000 | 0      | 3,805,313
```

**Column names can vary** (the parser is flexible):
- Account Name, Particulars, Account
- Opening Bl., Opening Balance, Opening
- Debit Amt., Debit Transactions, Debit, Dr
- Credit Amt., Credit Transactions, Credit, Cr
- Closing Bl., Closing Balance, Closing

## 🧪 Testing with Sample Data

To test the tool:

1. Prepare sample Tally Excel exports from 2-4 companies
2. Upload files
3. Review auto-detected mappings
4. Consolidate
5. Export to Excel and PDF
6. Compare with manual consolidation (if available)

## 🐛 Troubleshooting

### Files Won't Upload
- ✓ Check file format (.xlsx, .csv, .xls)
- ✓ Ensure file is not corrupted
- ✓ Maximum 4 files allowed

### Mapping Not Detecting Accounts
- ✓ Account names should have recognizable keywords (e.g., "Capital", "Assets")
- ✓ Matching is case-insensitive
- ✓ Manual mapping can be added if needed

### Export Fails
- ✓ Ensure you have consolidation data
- ✓ Browser may need to allow downloads
- ✓ Check browser console for errors

### Performance Issues
- ✓ Large files (5000+ accounts per company) may take longer to parse
- ✓ Clear browser cache if issues persist
- ✓ Ensure sufficient RAM available

## 📈 Extending the Tool

### Add Support for More Companies
1. Update `maxFiles` in FileUpload component
2. Adjust consolidation logic to handle more balances

### Custom Account Mappings
1. Modify `STANDARD_ACCOUNTS` in `utils/account-mapping.ts`
2. Add new account categories as needed

### Additional Calculations
1. Add ratios in `utils/financial-statements.ts`
2. Implement in export functions

## 📞 Support & Questions

For detailed usage instructions, see [README.md](README.md)

For technical details on implementation, refer to inline code comments.

## ✨ What's Next

To get started immediately:

```bash
cd artifacts/consolidation-tool
npm install
npm run dev
```

Then:
1. Prepare your 4 Tally trial balance Excel files
2. Upload them in the app
3. Review auto-detected mappings
4. Export consolidated financials

**That's it!** The tool handles all the complex consolidation logic for you.

---

**Built**: July 10, 2026
**Tech Stack**: React 18 + TypeScript + Vite + Tailwind CSS
**Status**: ✅ Production Ready
