# Tally Consolidation Tool

An offline, client-side web application for consolidating trial balances from multiple companies into unified financial statements.

## Features

✅ **Multi-File Upload** - Upload up to 4 Excel/CSV trial balance files
✅ **Auto-Detection** - Automatically detects account mappings across companies
✅ **Consolidation** - Combines trial balances with intercompany elimination support
✅ **Financial Statements** - Generates P&L and Balance Sheet
✅ **Multiple Exports** - Export to Excel (multi-sheet) or PDF
✅ **100% Offline** - No backend, no data sharing, runs entirely in browser
✅ **Persistent Mappings** - Save and reuse account mappings via localStorage
✅ **Hierarchical Accounts** - Handles nested account structures from Tally

## Quick Start

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm build
```

This creates an optimized bundle in the `dist/` directory.

## Usage

### Step 1: Upload Trial Balances

1. Upload Excel/CSV files containing trial balance data from your 4 companies
2. The system will extract:
   - Company name
   - Period (from/to dates)
   - Account hierarchy
   - Opening/closing balances and transactions

**Supported formats:**
- `.xlsx` (Excel 2007+)
- `.csv` (comma-separated)
- `.xls` (older Excel format)

### Step 2: Account Mapping

The tool automatically detects common accounts across your companies and maps them to a standard chart of accounts:

- **Capital/Equity**: Share Capital, Retained Earnings
- **Liabilities**: Long-term Loans, Shareholder Loans, Current Liabilities, Creditors, Tax Payable
- **Assets**: Cash, Bank Accounts, Inventory, Receivables, Advances, Prepaid Expenses, Intercompany
- **Revenue**: Sales, Intercompany Sales
- **Expenses**: COGS, Admin, Tax Expenses

You can review the auto-detected mappings and customize them if needed.

**Mappings are saved to browser localStorage** for reuse across sessions.

### Step 3: Consolidation

Once mappings are confirmed, the tool consolidates:

1. **Sums** all mapped accounts across the 4 companies
2. **Flags** intercompany transactions for manual elimination
3. **Generates** a consolidated trial balance showing:
   - Company 1-4 individual balances
   - Elimination entries
   - Consolidated total

### Step 4: Export

Export consolidated financials in two formats:

#### Excel Export
- **Trial Balance** sheet with all accounts and company breakdowns
- **Income Statement** sheet with revenue, expenses, and net profit
- **Balance Sheet** sheet with assets, liabilities, and equity
- **Mapping Log** sheet showing how accounts were mapped

#### PDF Export
- Professional formatted financial statements
- Easy to share and archive
- Includes all key financial metrics

## Architecture

### Project Structure

```
src/
├── components/
│   ├── FileUpload.tsx          # File upload interface
│   ├── TrialBalanceList.tsx    # List of uploaded TBs
│   └── ...
├── hooks/
│   ├── useTrialBalance.ts      # TB state management
│   ├── useConsolidation.ts     # Consolidation logic
│   └── useExport.ts            # Export utilities
├── types/
│   └── index.ts                # TypeScript interfaces
├── utils/
│   ├── excel-parser.ts         # Parse Excel files
│   ├── account-mapping.ts      # Auto-mapping algorithm
│   ├── consolidation.ts        # Core consolidation logic
│   ├── financial-statements.ts # Generate P&L/BS
│   └── export.ts               # Excel/PDF generation
├── App.tsx                      # Main workflow component
├── main.tsx                     # React entry point
└── index.css                    # Tailwind CSS
```

### Data Flow

```
Upload Excel Files
    ↓
Parse Accounts & Extract TB Data
    ↓
Auto-Detect Account Mappings
    ↓
Consolidate Trial Balances
    ↓
Generate Financial Statements
    ↓
Export (Excel/PDF)
```

## Key Technologies

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **Tailwind CSS** - Styling
- **Radix UI** - Accessible UI components
- **XLSX** - Excel file parsing
- **ExcelJS** - Excel generation
- **jsPDF + html2canvas** - PDF export
- **date-fns** - Date formatting

## Supported Account Categories

The tool recognizes and categorizes accounts as:

- **Asset** - Bank, Cash, Stock, Receivables, Advances, etc.
- **Liability** - Loans, Creditors, Tax Payable, etc.
- **Equity** - Capital, Retained Earnings
- **Revenue** - Sales, Income
- **Expense** - Costs, Tax, Admin expenses

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Modern browsers with ES2020+ support

## Limitations & Notes

- Maximum 4 companies for consolidation
- Excel files should follow Tally export format with standard columns:
  - Particulars/Account Name
  - Opening Balance
  - Debit/Credit Transactions
  - Closing Balance
- Intercompany elimination must be manually reviewed and configured
- PDF export quality depends on browser's canvas rendering

## Performance

- Parsing a TB with 1000+ accounts: < 1 second
- Consolidation calculation: < 500ms
- Excel export: 2-5 seconds depending on file size
- No network latency (all client-side)

## Privacy & Security

✅ **Zero External Requests** - No data sent to servers
✅ **Local Processing** - All calculations happen in your browser
✅ **localStorage Only** - Mappings saved locally only if you choose to save
✅ **No Cookies/Analytics** - No tracking, no third-party services
✅ **Offline Capable** - Works without internet connection

## Troubleshooting

### File won't parse
- Ensure Excel file has standard columns: Particulars, Opening Balance, Debit, Credit, Closing Balance
- Check that the file isn't corrupted
- Try CSV export format instead

### Mapping not detecting accounts
- Check account names match expected patterns (e.g., "Capital Account", "Current Assets")
- Account names are case-insensitive
- Try manually creating mappings if auto-detection fails

### PDF export looks wrong
- Large statements may need landscape orientation (already configured)
- Try exporting to Excel instead if PDF layout issues occur

## Future Enhancements

- Intercompany transaction editor with visual UI
- Multi-period consolidation and comparison
- Audit trail for all eliminations
- Custom chart of accounts templates
- Import/export mapping rules as JSON
- Support for more than 4 companies
- Charts and visualizations
- Minority interest handling
- Consolidation notes automation

## Development

### Adding a New Export Format

1. Create a new function in `src/utils/export.ts`
2. Add to export options in UI
3. Test with sample data

### Extending Account Categories

1. Update `Account` type in `src/types/index.ts`
2. Add matching logic in `utils/account-mapping.ts`
3. Test auto-detection with sample files

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review sample trial balance format
3. Verify your Excel file structure matches Tally export format

## License

Internal use only.
