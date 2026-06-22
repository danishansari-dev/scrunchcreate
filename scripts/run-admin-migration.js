/**
 * Why this script exists:
 * Parses the VITE_ADMIN_EMAILS environment variable from the .env file,
 * interpolates the list of emails into the SQL migration template
 * (supabase/migrations/20260621224558_admin_rls_policies.sql),
 * and writes the compiled SQL to scripts/admin-migration-compiled.sql.
 *
 * Usage: node scripts/run-admin-migration.js
 */
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env
const envPath = join(__dirname, '..', '.env');
let envContent = '';
try {
  envContent = readFileSync(envPath, 'utf-8');
} catch (e) {
  console.error('❌ Failed to read .env file at:', envPath);
  process.exit(1);
}

const env = {};
envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx === -1) return;
  const key = trimmed.slice(0, eqIdx).trim();
  const value = trimmed.slice(eqIdx + 1).trim();
  env[key] = value;
});

const adminEmailsRaw = env.VITE_ADMIN_EMAILS || '';
const emails = adminEmailsRaw
  .split(',')
  .map(e => e.trim())
  .filter(Boolean);

// Default to a dummy non-matching email if no emails are specified, preventing SQL syntax errors
const formattedEmails = emails.length > 0
  ? emails.map(email => `'${email.toLowerCase()}'`).join(', ')
  : "'none@none.com'";

console.log('👥 Detected admin emails for RLS migration:', emails);

// Read SQL template
const sqlTemplatePath = join(__dirname, '..', 'supabase', 'migrations', '20260621224558_admin_rls_policies.sql');
let sqlContent = '';
try {
  sqlContent = readFileSync(sqlTemplatePath, 'utf-8');
} catch (e) {
  console.error('❌ Failed to read SQL template at:', sqlTemplatePath);
  process.exit(1);
}

// Compile SQL by replacing the placeholder
const compiledSql = sqlContent.replace(/__ADMIN_EMAILS_PLACEHOLDER__/g, formattedEmails);

// Write compiled SQL
const outputPath = join(__dirname, 'admin-migration-compiled.sql');
try {
  writeFileSync(outputPath, compiledSql, 'utf-8');
  console.log('✅ Compiled SQL migration successfully written to:');
  console.log(`   scripts/admin-migration-compiled.sql`);
  console.log('\n📋 Please copy the contents of the compiled file and run them in your Supabase SQL Editor.');
} catch (e) {
  console.error('❌ Failed to write compiled SQL migration:', e.message);
  process.exit(1);
}
