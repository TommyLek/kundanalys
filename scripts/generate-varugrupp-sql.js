import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const csvPath = path.join(__dirname, '..', 'Varugrupper.csv');
const sqlPath = path.join(__dirname, '..', 'varugrupper-import.sql');

const csvContent = fs.readFileSync(csvPath, 'utf-8');
const lines = csvContent.split('\n').filter(line => line.trim());

// Skip header
const dataLines = lines.slice(1);

const sqlStatements = ['-- Import varugrupper från CSV', '-- Genererad automatiskt', ''];
sqlStatements.push('INSERT INTO varugrupp (varugrupp_id, varugrupp_namn, aktiv) VALUES');

const values = [];

for (const line of dataLines) {
  // Parse semicolon-separated, quoted values
  const match = line.match(/"([^"]*)";"([^"]*)"/);
  if (match) {
    const id = match[1].trim();
    const namn = match[2].trim().replace(/'/g, "''"); // Escape single quotes for SQL
    if (id && namn) {
      values.push(`  ('${id}', '${namn}', true)`);
    }
  }
}

sqlStatements.push(values.join(',\n'));
sqlStatements.push('ON CONFLICT (varugrupp_id) DO UPDATE SET');
sqlStatements.push('  varugrupp_namn = EXCLUDED.varugrupp_namn;');

fs.writeFileSync(sqlPath, sqlStatements.join('\n'), 'utf-8');

console.log(`Genererade SQL för ${values.length} varugrupper till ${sqlPath}`);
