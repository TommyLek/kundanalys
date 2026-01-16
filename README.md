# Kundanalys

En React-applikation för att analysera kundförsäljningsdata. Ladda upp CSV-filer med orderdata och få en visuell översikt över försäljning per kund.

## Funktioner

- **CSV-import**: Ladda upp försäljningsdata i CSV-format
- **Kundöversikt**: Välj kund och se sammanfattad statistik
- **KPI-kort**: Total försäljning, antal ordrar, snittordervärde, marginal
- **Försäljningsdiagram**: Månadsvis försäljningsutveckling
- **Kategorifördelning**: Försäljning per varugrupp (cirkeldiagram)
- **Toppprodukter**: Lista över mest sålda artiklar
- **PDF-export**: Exportera kundrapporter till PDF
- **Beräkningsverktyg**: Verktyg för procentbaserade beräkningar
- **Kundvisningsläge**: Dölj intern data (marginal, kostnad) vid kundpresentationer

## Administration

- **Varugruppregister**: Hantera varugrupper med koppling till Supabase
- **Artikelregister**: Hantera artiklar med koppling till Supabase

## Teknisk stack

- React 19
- TypeScript
- Vite
- Tailwind CSS 4
- Recharts (diagram)
- jsPDF (PDF-export)
- PapaParse (CSV-parsing)
- Supabase (databaskoppling)
- date-fns (datumhantering)

## Kom igång

```bash
# Installera beroenden
npm install

# Starta utvecklingsserver
npm run dev

# Bygg för produktion
npm run build

# Förhandsgranska produktionsbygge
npm run preview
```

## Användning

1. Starta appen med `npm run dev`
2. Ladda upp en CSV-fil med orderdata
3. Välj en kund i dropdown-menyn
4. Utforska försäljningsstatistik och diagram
5. Använd "Kundvisning" för att dölja intern data
6. Exportera rapport till PDF vid behov

## CSV-format

CSV-filen ska innehålla följande kolumner:
- Koncern, Firma, Ställe, Kundnummer
- Fakturadatum, Ordernummer, Faktura / verifikationsnummer
- Antal, Varugrupp, Artikelnummer
- Fakturarat belopp, Fakturerad prisenhet
- Fakturarat kostbelopp (intern data)
- Pristillsättning - försäljningspris, Pristillsättning, kostpris
- Orderbehandlare, Kontantförsäljnings kod
