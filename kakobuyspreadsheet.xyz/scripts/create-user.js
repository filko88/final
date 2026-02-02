const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://sqemnmhnqfhwhvfahtdm.supabase.co";
// Service role key for admin actions (bypassing RLS)
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxZW1ubWhucWZod2h2ZmFodGRtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Njc1OTc2OSwiZXhwIjoyMDgyMzM1NzY5fQ.BqsT98RZ_W0ZUlC7WLm_Cg6c2zZJx9_asYAgRPD4TQQ";

if (!supabaseUrl || !serviceKey) {
    console.error('Missing URL or SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
    console.log('Usage: node scripts/create-user.js <email> <password>');
    process.exit(1);
}

async function createUser() {
    console.log(`Creating user: ${email}...`);

    const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true // Auto confirm
    });

    if (error) {
        console.error('Error creating user:', error.message);
        return;
    }

    console.log('User created successfully:', data.user.id);
    console.log('You can now log in with these credentials.');
}

createUser();
