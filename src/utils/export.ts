import ExcelJS from "exceljs";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  ConsolidatedTrialBalance,
  FinancialStatements,
  AccountMapping,
} from "../types";
import { formatCurrency } from "./financial-statements";

export async function exportToExcel(
  consolidated: ConsolidatedTrialBalance,
  statements: FinancialStatements,
  mappings: Map<string, AccountMapping>
): Promise<void> {
  const workbook = new ExcelJS.Workbook();

  // Trial Balance Sheet
  addTrialBalanceSheet(workbook, consolidated);

  // Income Statement Sheet
  addIncomeStatementSheet(workbook, statements);

  // Balance Sheet
  addBalanceSheetSheet(workbook, statements);

  // Mapping Log Sheet
  addMappingLogSheet(workbook, mappings);

  // Save the file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  downloadFile(blob, "consolidated-financials.xlsx");
}

function addTrialBalanceSheet(
  workbook: ExcelJS.Workbook,
  consolidated: ConsolidatedTrialBalance
): void {
  const sheet = workbook.addWorksheet("Trial Balance");

  // Header
  sheet.columns = [
    { header: "Account Code", key: "code", width: 15 },
    { header: "Account Name", key: "name", width: 30 },
    { header: "Category", key: "category", width: 15 },
    { header: "Company 1", key: "company1", width: 15 },
    { header: "Company 2", key: "company2", width: 15 },
    { header: "Company 3", key: "company3", width: 15 },
    { header: "Company 4", key: "company4", width: 15 },
    { header: "Eliminations", key: "eliminations", width: 15 },
    { header: "Consolidated", key: "consolidated", width: 15 },
  ];

  // Format header row
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFD3D3D3" },
  };

  // Add data rows
  consolidated.accounts.forEach((acc) => {
    sheet.addRow({
      code: acc.standardAccountCode,
      name: acc.standardAccountName,
      category: acc.category,
      company1: acc.balances.company1,
      company2: acc.balances.company2,
      company3: acc.balances.company3,
      company4: acc.balances.company4,
      eliminations: acc.eliminations,
      consolidated: acc.consolidated,
    });
  });

  // Format number columns
  sheet.columns.forEach((col, index) => {
    if (index > 2) {
      // Skip first 3 columns
      col.numFmt = "#,##0.00";
    }
  });
}

function addIncomeStatementSheet(
  workbook: ExcelJS.Workbook,
  statements: FinancialStatements
): void {
  const sheet = workbook.addWorksheet("Income Statement");
  const is = statements.incomeStatement;

  let row = 1;

  // Header
  sheet.getCell(row, 1).value = "INCOME STATEMENT";
  sheet.getCell(row, 1).font = { bold: true, size: 14 };
  row += 2;

  // Revenue Section
  sheet.getCell(row, 1).value = "REVENUE";
  sheet.getCell(row, 1).font = { bold: true };
  row++;

  is.revenue.forEach((item) => {
    sheet.getCell(row, 1).value = item.account;
    sheet.getCell(row, 2).value = item.consolidated;
    row++;
  });

  sheet.getCell(row, 1).value = "Total Revenue";
  sheet.getCell(row, 1).font = { bold: true };
  sheet.getCell(row, 2).value = is.totalRevenue;
  sheet.getCell(row, 2).font = { bold: true };
  row += 2;

  // Expenses Section
  sheet.getCell(row, 1).value = "EXPENSES";
  sheet.getCell(row, 1).font = { bold: true };
  row++;

  is.expenses.forEach((item) => {
    sheet.getCell(row, 1).value = item.account;
    sheet.getCell(row, 2).value = item.consolidated;
    row++;
  });

  sheet.getCell(row, 1).value = "Total Expenses";
  sheet.getCell(row, 1).font = { bold: true };
  sheet.getCell(row, 2).value = is.totalExpenses;
  sheet.getCell(row, 2).font = { bold: true };
  row += 2;

  // Net Profit
  sheet.getCell(row, 1).value = "NET PROFIT";
  sheet.getCell(row, 1).font = { bold: true, size: 12 };
  sheet.getCell(row, 2).value = is.netProfit;
  sheet.getCell(row, 2).font = { bold: true, size: 12 };

  // Format numbers
  sheet.getColumn(2).numFmt = "#,##0.00";
  sheet.getColumn(1).width = 40;
  sheet.getColumn(2).width = 20;
}

function addBalanceSheetSheet(
  workbook: ExcelJS.Workbook,
  statements: FinancialStatements
): void {
  const sheet = workbook.addWorksheet("Balance Sheet");
  const bs = statements.balanceSheet;

  let row = 1;

  // Header
  sheet.getCell(row, 1).value = "BALANCE SHEET";
  sheet.getCell(row, 1).font = { bold: true, size: 14 };
  row += 2;

  // Assets
  sheet.getCell(row, 1).value = "ASSETS";
  sheet.getCell(row, 1).font = { bold: true };
  row++;

  bs.assets.forEach((item) => {
    sheet.getCell(row, 1).value = item.account;
    sheet.getCell(row, 2).value = item.consolidated;
    row++;
  });

  sheet.getCell(row, 1).value = "Total Assets";
  sheet.getCell(row, 1).font = { bold: true };
  sheet.getCell(row, 2).value = bs.totalAssets;
  sheet.getCell(row, 2).font = { bold: true };
  row += 2;

  // Liabilities
  sheet.getCell(row, 1).value = "LIABILITIES";
  sheet.getCell(row, 1).font = { bold: true };
  row++;

  bs.liabilities.forEach((item) => {
    sheet.getCell(row, 1).value = item.account;
    sheet.getCell(row, 2).value = item.consolidated;
    row++;
  });

  sheet.getCell(row, 1).value = "Total Liabilities";
  sheet.getCell(row, 1).font = { bold: true };
  sheet.getCell(row, 2).value = bs.totalLiabilities;
  sheet.getCell(row, 2).font = { bold: true };
  row += 2;

  // Equity
  sheet.getCell(row, 1).value = "EQUITY";
  sheet.getCell(row, 1).font = { bold: true };
  row++;

  bs.equity.forEach((item) => {
    sheet.getCell(row, 1).value = item.account;
    sheet.getCell(row, 2).value = item.consolidated;
    row++;
  });

  sheet.getCell(row, 1).value = "Total Equity";
  sheet.getCell(row, 1).font = { bold: true };
  sheet.getCell(row, 2).value = bs.totalEquity;
  sheet.getCell(row, 2).font = { bold: true };
  row += 2;

  sheet.getCell(row, 1).value = "Total Liabilities + Equity";
  sheet.getCell(row, 1).font = { bold: true };
  sheet.getCell(row, 2).value = bs.totalLiabilities + bs.totalEquity;
  sheet.getCell(row, 2).font = { bold: true };

  sheet.getColumn(2).numFmt = "#,##0.00";
  sheet.getColumn(1).width = 40;
  sheet.getColumn(2).width = 20;
}

function addMappingLogSheet(
  workbook: ExcelJS.Workbook,
  mappings: Map<string, AccountMapping>
): void {
  const sheet = workbook.addWorksheet("Mapping Log");

  sheet.columns = [
    { header: "Standard Account Code", key: "code", width: 20 },
    { header: "Standard Account Name", key: "name", width: 30 },
    { header: "Category", key: "category", width: 15 },
    { header: "Mapped Company Accounts", key: "mapped", width: 40 },
  ];

  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFD3D3D3" },
  };

  mappings.forEach((mapping) => {
    const mappedAccountNames = mapping.mappedAccounts
      .map((m) => `${m.company}: ${m.accountName}`)
      .join("; ");

    sheet.addRow({
      code: mapping.standardAccountCode,
      name: mapping.standardAccountName,
      category: mapping.category,
      mapped: mappedAccountNames,
    });
  });
}

export async function exportToPDF(
  htmlElement: HTMLElement,
  filename: string = "consolidated-statements.pdf"
): Promise<void> {
  try {
    const canvas = await html2canvas(htmlElement, {
      scale: 2,
      useCORS: true,
      logging: false,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const imgWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let heightLeft = canvas.height * (imgWidth / canvas.width);
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgWidth * (canvas.height / canvas.width));
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - canvas.height * (imgWidth / canvas.width);
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgWidth * (canvas.height / canvas.width));
      heightLeft -= pageHeight;
    }

    pdf.save(filename);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
}

function downloadFile(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
