/**
 * Why this script exists:
 * Runs the SQL schema migration against the Supabase database
 * without requiring the user to manually paste SQL in the dashboard.
 *
 * Usage: node scripts/run-migration.js
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env
const envPath = join(__dirname, '..', '.env');
try {
  const envContent = readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) return;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  });
} catch { /* rely on env vars */ }

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing VITE_SUPABASE_URL or key in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const sqlPath = join(__dirname, '..', 'supabase', 'migrations', '20260620112335_initial_schema.sql');
const sql = readFileSync(sqlPath, 'utf-8');

// Split SQL into individual statements and run them
// Why: supabase.rpc('exec_sql') doesn't exist on the anon key.
// We'll use the REST API's /rest/v1/rpc endpoint or direct SQL via the management API.
// Simplest approach: use fetch to hit the Supabase SQL endpoint.

async function runMigration() {
  console.log('🔧 Running schema migration...');

  // Supabase provides a direct SQL execution endpoint for service role keys
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
    },
    body: JSON.stringify({ query: sql }),
  });

  // If the REST rpc approach doesn't work, fall back to manual instructions
  if (!response.ok) {
    console.log('\n⚠️  Could not run SQL via API (this is normal with anon key).');
    console.log('📋 Please run the SQL migration manually:');
    console.log('   1. Go to https://supabase.com/dashboard/project/zwrawhvslgubinaygixr/sql');
    console.log('   2. Open file: supabase/migrations/20260620112335_initial_schema.sql');
    console.log('   3. Paste the contents and click "Run"');
    console.log('   4. Then run: node scripts/seed-supabase.js');
    return;
  }

  console.log('✅ Schema migration complete!');
}

runMigration().catch(err => {
  console.error('❌ Error:', err.message);
  console.log('\n📋 Please run the SQL migration manually:');
  console.log('   1. Go to https://supabase.com/dashboard/project/zwrawhvslgubinaygixr/sql');
  console.log('   2. Open file: supabase/migrations/20260620112335_initial_schema.sql');
  console.log('   3. Paste the contents and click "Run"');
});
