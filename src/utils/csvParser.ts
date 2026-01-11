import Papa from 'papaparse';
import { parse } from 'date-fns';
import type { OrderRow, RawOrderRow } from '../types';

function parseSwedishNumber(value: string): number {
  if (!value || value.trim() === '') return 0;
  // Swedish format uses comma as decimal separator
  const normalized = value.replace(',', '.').replace(/\s/g, '');
  const num = parseFloat(normalized);
  return isNaN(num) ? 0 : num;
}

function parseDate(dateStr: string): Date {
  // Format: YYYYMMDD
  if (!dateStr || dateStr.length !== 8) {
    return new Date();
  }
  return parse(dateStr, 'yyyyMMdd', new Date());
}

function transformRow(raw: RawOrderRow): OrderRow {
  return {
    koncern: parseInt(raw.Koncern) || 0,
    firma: parseInt(raw.Firma) || 0,
    stalle: parseInt(raw['Ställe']) || 0,
    kundnummer: parseInt(raw.Kundnummer) || 0,
    fakturadatum: parseDate(raw.Fakturadatum),
    ordernummer: parseInt(raw.Ordernummer) || 0,
    fakturanummer: parseInt(raw['Faktura / verifikationsnummer']) || 0,
    antal: parseSwedishNumber(raw.Antal),
    varugrupp: raw.Varugrupp?.replace(/"/g, '').trim() || '',
    artikelnummer: raw.Artikelnummer?.trim() || '',
    faktureratBelopp: parseSwedishNumber(raw['Fakturarat belopp']),
    prisenhet: raw['Fakturerad prisenhet']?.trim() || '',
    kostbelopp: parseSwedishNumber(raw['Fakturarat kostbelopp']),
    pristillsattningForsaljning: raw['Pristillsättning - försäljningspris']?.trim() || '',
    pristillsattningKostpris: raw['Pristillsättning, kostpris']?.trim() || '',
    orderbehandlare: parseInt(raw.Orderbehandlare) || 0,
    kontantforsaljningskod: raw['Kontantförsäljnings kod']?.trim() || '',
  };
}

export function parseCSV(file: File): Promise<OrderRow[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<RawOrderRow>(file, {
      header: true,
      delimiter: ';',
      skipEmptyLines: true,
      encoding: 'UTF-8',
      complete: (results) => {
        if (results.errors.length > 0) {
          console.warn('CSV parse warnings:', results.errors);
        }
        const rows = results.data.map(transformRow);
        resolve(rows);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
}

export function filterByCustomer(rows: OrderRow[], kundnummer: number): OrderRow[] {
  return rows.filter((row) => row.kundnummer === kundnummer);
}

export function getUniqueCustomers(rows: OrderRow[]): number[] {
  const customers = new Set(rows.map((row) => row.kundnummer));
  return Array.from(customers).sort((a, b) => a - b);
}
