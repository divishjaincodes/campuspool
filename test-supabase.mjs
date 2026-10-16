import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
let supabaseUrl = '';
let supabaseKey = '';

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('VITE_SUPABASE_URL=')) {
      supabaseUrl = trimmed.substring('VITE_SUPABASE_URL='.length).trim();
    }
    if (trimmed.startsWith('VITE_SUPABASE_ANON_KEY=')) {
      supabaseKey = trimmed.substring('VITE_SUPABASE_ANON_KEY='.length).trim();
    }
  });
}

console.log('--- CAMPUSPOOL SUPABASE CONNECTION TEST ---');
console.log('Project URL:', supabaseUrl || '(not configured)');
console.log('Publishable Key:', supabaseKey ? supabaseKey.substring(0, 16) + '...' : '(not configured)');

if (!supabaseUrl || supabaseUrl.includes('your-project-id')) {
  console.log('\n❌ Supabase Project URL is missing or set to placeholder.');
  console.log('👉 Please paste your Project URL in `.env`:');
  console.log('   VITE_SUPABASE_URL=https://<your-project-id>.supabase.co');
  process.exit(1);
}

try {
  const client = createClient(supabaseUrl, supabaseKey);
  const tables = ['profiles', 'rides', 'bookings', 'conversations', 'messages', 'reviews', 'reports'];
  console.log('\n--- AUDITING TABLES ---');
  for (const table of tables) {
    const { data, count, error } = await client.from(table).select('*', { count: 'exact', head: true });
    if (error) {
      console.log(`❌ Table '${table}': ${error.message} (Code: ${error.code})`);
    } else {
      console.log(`✅ Table '${table}': Accessible, Count = ${count ?? 0}`);
    }
  }

  console.log('\n--- AUDITING RPC PROCEDURES ---');
  // Attempt a call to book_ride with exact parameter signature
  const { data: rpcData, error: rpcErr } = await client.rpc('book_ride', {
    p_ride_id: '00000000-0000-0000-0000-000000000000',
    p_seats_requested: 1,
    p_message: 'test'
  });
  if (rpcErr) {
    if (rpcErr.code === 'PGRST202') {
      console.log('ℹ️  RPC book_ride: Not installed in DB yet (will use client transactional fallback until migration is run in Supabase SQL editor)');
    } else {
      console.log(`✅ RPC book_ride: Installed & active! (Returned validation: "${rpcErr.message}")`);
    }
  } else {
    console.log('✅ RPC book_ride: Executed successfully:', rpcData);
  }

} catch (err) {
  console.error('\n❌ Connection test error:', err.message);
}
