const fs = require('fs');
const path = require('path');

const envContent = `NEXT_PUBLIC_SUPABASE_URL=https://sqemnmhnqfhwhvfahtdm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxZW1ubWhucWZod2h2ZmFodGRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3NTk3NjksImV4cCI6MjA4MjMzNTc2OX0.o7S5UIBiQAwQQz9x6eIpHleUPzRFNn2oXlkMw6YSjLk
POSTGRES_URL=postgres://postgres.sqemnmhnqfhwhvfahtdm:URVOsDdiXfpA6lZ5@aws-1-eu-central-2.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x
`;

const filePath = path.join(__dirname, '..', '.env.local');

try {
    fs.writeFileSync(filePath, envContent, { encoding: 'utf8' });
    console.log('Successfully fixed .env.local file');
} catch (err) {
    console.error('Error writing .env.local:', err);
}
