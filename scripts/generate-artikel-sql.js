import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const csvPath = path.join(__dirname, '..', 'Artiklar.csv');
const outputDir = path.join(__dirname, '..', 'artiklar-import');

// Create output directory
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const csvContent = fs.readFileSync(csvPath, 'utf-8');
const lines = csvContent.split('\n').filter(line => line.trim());

// Skip header
const dataLines = lines.slice(1);

const BATCH_SIZE = 5000; // Supabase can handle 5000 rows per INSERT
let batchNum = 0;
let values = [];
let totalCount = 0;

function writeBatch() {
  if (values.length === 0) return;

  const sqlPath = path.join(outputDir, `batch_${String(batchNum).padStart(3, '0')}.sql`);
  const sql = [
    `-- Batch ${batchNum}: ${values.length} artiklar`,
    '',
    'INSERT INTO artikel (artikelnummer, varugrupp_id, artikeltext, leverantor_kontonummer, aktiv) VALUES',
    values.join(',\n'),
    'ON CONFLICT (artikelnummer) DO UPDATE SET',
    '  varugrupp_id = EXCLUDED.varugrupp_id,',
    '  artikeltext = EXCLUDED.artikeltext,',
    '  leverantor_kontonummer = EXCLUDED.leverantor_kontonummer;',
    ''
  ].join('\n');

  fs.writeFileSync(sqlPath, sql, 'utf-8');
  console.log(`Skrev batch ${batchNum} med ${values.length} artiklar`);

  batchNum++;
  values = [];
}

for (const line of dataLines) {
  // Parse semicolon-separated values: "varugrupp";"artikelnr";"text";leverantor
  // Some fields might not be quoted
  const parts = line.split(';');
  if (parts.length >= 4) {
    const varugrupp = parts[0].replace(/"/g, '').trim();
    const artikelnummer = parts[1].replace(/"/g, '').trim();
    const artikeltext = parts[2].replace(/"/g, '').trim().replace(/'/g, "''"); // Escape single quotes
    const leverantor = parts[3].replace(/"/g, '').trim();

    // Skip rows without artikelnummer
    if (artikelnummer) {
      values.push(`  ('${artikelnummer}', ${varugrupp ? `'${varugrupp}'` : 'NULL'}, '${artikeltext}', ${leverantor || 'NULL'}, true)`);
      totalCount++;

      if (values.length >= BATCH_SIZE) {
        writeBatch();
      }
    }
  }
}

// Write remaining values
writeBatch();

console.log(`\nTotalt: ${totalCount} artiklar i ${batchNum} batch-filer`);
console.log(`Filerna finns i: ${outputDir}`);
console.log('\nKör varje fil i Supabase SQL Editor i ordning.');
