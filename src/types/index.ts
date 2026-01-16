export interface OrderRow {
  koncern: number;
  firma: number;
  stalle: number;
  kundnummer: number;
  fakturadatum: Date;
  ordernummer: number;
  fakturanummer: number;
  antal: number;
  varugrupp: string;
  artikelnummer: string;
  faktureratBelopp: number;
  prisenhet: string;
  kostbelopp: number; // Känslig - ej i kund-PDF
  pristillsattningForsaljning: string;
  pristillsattningKostpris: string;
  orderbehandlare: number;
  kontantforsaljningskod: string;
}

export interface RawOrderRow {
  Koncern: string;
  Firma: string;
  'Ställe': string;
  Kundnummer: string;
  Fakturadatum: string;
  Ordernummer: string;
  'Faktura / verifikationsnummer': string;
  Antal: string;
  Varugrupp: string;
  Artikelnummer: string;
  'Fakturarat belopp': string;
  'Fakturerad prisenhet': string;
  'Fakturarat kostbelopp': string;
  'Pristillsättning - försäljningspris': string;
  'Pristillsättning, kostpris': string;
  Orderbehandlare: string;
  'Kontantförsäljnings kod': string;
}

export interface SalesKPI {
  totalForsaljning: number;
  antalOrdrar: number;
  antalOrderrader: number;
  snittOrdervarde: number;
  totalKostnad: number;
  marginal: number;
  marginalProcent: number;
}

export interface MonthlySales {
  month: string;
  year: number;
  monthNum: number;
  forsaljning: number;
  kostnad: number;
  ordrar: number;
}

export interface CategorySales {
  varugrupp: string;
  forsaljning: number;
  antal: number;
  kostnad: number;
  marginal: number;
}

export interface ProductSales {
  artikelnummer: string;
  varugrupp: string;
  forsaljning: number;
  antal: number;
  kostnad: number;
}

export interface CustomerSummary {
  kundnummer: number;
  period: {
    start: Date;
    end: Date;
  };
  kpis: SalesKPI;
  monthlySales: MonthlySales[];
  topCategories: CategorySales[];
  topProducts: ProductSales[];
}

export type BonusType = 'rak' | 'medAvdrag'

export interface BonusCalculation {
  baseAmount: number;
  deductedAmount: number;
  bonusAmount: number;
}
