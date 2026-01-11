# Plan: Varugruppregister med Supabase

## Sammanfattning
Implementera ett varugruppregister i Supabase med admin-gränssnitt i React-appen. Dashboarden visar sedan varugruppnamn istället för bara koder.

---

## Steg 1: Supabase-setup (manuellt)

1. Skapa projekt på https://supabase.com
2. Kör SQL för att skapa tabellen:

```sql
CREATE TABLE varugrupp (
    varugrupp_id VARCHAR(10) PRIMARY KEY,
    varugrupp_namn VARCHAR(100) NOT NULL,
    beskrivning TEXT,
    aktiv BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies
ALTER TABLE varugrupp ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON varugrupp FOR SELECT USING (true);
```

3. Kopiera Project URL och anon key från Settings > API

---

## Steg 2: Installera dependencies

```bash
npm install @supabase/supabase-js
```

Skapa `.env.local`:
```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
```

---

## Steg 3: Nya filer att skapa

| Fil | Beskrivning |
|-----|-------------|
| `src/lib/supabase.ts` | Supabase-klient |
| `src/types/supabase.ts` | TypeScript-typer för databasen |
| `src/hooks/useVarugrupper.ts` | CRUD-hook för varugrupper |
| `src/context/VarugruppContext.tsx` | React context för lookup |
| `src/components/admin/AdminLayout.tsx` | Layout för admin-sidor |
| `src/components/admin/VarugruppAdmin.tsx` | Huvudsida för admin |
| `src/components/admin/VarugruppForm.tsx` | Formulär för skapa/redigera |
| `src/components/admin/VarugruppTable.tsx` | Tabell med varugrupper |

---

## Steg 4: Modifiera befintliga filer

| Fil | Ändring |
|-----|---------|
| `src/App.tsx` | Lägg till navigation, VarugruppProvider, admin-vy |
| `src/components/CategoryBreakdown.tsx` | Använd `getVarugruppNamn()` för att visa namn |
| `src/components/TopProducts.tsx` | Använd `getVarugruppNamn()` för att visa namn |
| `src/types/index.ts` | Exportera Supabase-typer |
| `.gitignore` | Lägg till `.env.local` |

---

## Steg 5: Funktionalitet

### Admin-gränssnitt
- Lista alla varugrupper i tabell
- Skapa ny varugrupp (ID, namn, beskrivning, aktiv)
- Redigera befintlig varugrupp
- Ta bort varugrupp (med bekräftelse)
- Navigera via knapp i header

### Dashboard-integration
- CategoryBreakdown visar "Elektronik (6479)" istället för bara "6479"
- TopProducts visar varugruppnamn i tabellen
- Fallback till kod om namn saknas

---

## Verifiering

1. **Supabase-anslutning**: Starta appen, gå till Varugruppregister - ska visa "Inga varugrupper"
2. **CRUD**: Skapa en varugrupp, redigera den, ta bort den
3. **Dashboard**: Ladda CSV, välj kund - varugruppnamn ska visas i diagram och tabell
4. **Fallback**: Varugrupper utan registrerat namn visar fortfarande koden

---

## Framtida utbyggnad

Samma mönster kan användas för:
- Artikelregister (med FK till varugrupp)
- Orderbehandlarregister (säljare)
- Kundregister
