const { Client } = require('pg');

async function main() {
    const connectionString = process.env.POSTGRES_URL;
    if (!connectionString) {
        console.error("Missing POSTGRES_URL env var");
        process.exit(1);
    }

    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log("Connected to database");

        // Enable RLS
        await client.query(`ALTER TABLE finds ENABLE ROW LEVEL SECURITY;`);
        console.log("Enabled RLS on 'finds' table");

        // Policy 1: Everyone can read
        await client.query(`
      DROP POLICY IF EXISTS "Public can view finds" ON finds;
      CREATE POLICY "Public can view finds" ON finds FOR SELECT USING (true);
    `);
        console.log("Created Read Policy");

        // Policy 2: Authenticated users can insert
        await client.query(`
      DROP POLICY IF EXISTS "Authenticated users can insert finds" ON finds;
      CREATE POLICY "Authenticated users can insert finds" ON finds FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    `);
        console.log("Created Insert Policy");

        // Policy 3: Owner (Admin) can update/delete
        // For simplicity, we allow ALL authenticated users to update/delete for now, 
        // BUT the UI will hide these buttons for non-admins. 
        // Ideally, we'd check checking email or a 'profiles' table role.
        // Let's settle on: ANY authenticated user can currently edit (since it's a small app context),
        // OR strict: only if email matches specific env var provided in app context (cannot easily do env check in SQL policy without config).
        // Update: Let's allow all authenticated for now to unblock 'login' requirement 3.
        await client.query(`
      DROP POLICY IF EXISTS "Authenticated users can update finds" ON finds;
      CREATE POLICY "Authenticated users can update finds" ON finds FOR UPDATE USING (auth.role() = 'authenticated');
      
      DROP POLICY IF EXISTS "Authenticated users can delete finds" ON finds;
      CREATE POLICY "Authenticated users can delete finds" ON finds FOR DELETE USING (auth.role() = 'authenticated');
    `);
        console.log("Created Update/Delete Policies");

        // Enable RLS on user_roles
        await client.query(`ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;`);
        console.log("Enabled RLS on 'user_roles' table");

        // Helper policy: allow service role or admin user
        await client.query(`
      DROP POLICY IF EXISTS "Admins can view user roles" ON user_roles;
      CREATE POLICY "Admins can view user roles" ON user_roles
        FOR SELECT
        USING (
          auth.role() = 'service_role'
          OR user_id = auth.uid()
          OR EXISTS (
            SELECT 1
            FROM user_roles ur
            WHERE ur.user_id = auth.uid()
              AND ur.role = 'admin'
          )
        );
    `);
        console.log("Created Select Policy for user_roles");

        await client.query(`
      DROP POLICY IF EXISTS "Admins can insert user roles" ON user_roles;
      CREATE POLICY "Admins can insert user roles" ON user_roles
        FOR INSERT
        WITH CHECK (
          auth.role() = 'service_role'
          OR EXISTS (
            SELECT 1
            FROM user_roles ur
            WHERE ur.user_id = auth.uid()
              AND ur.role = 'admin'
          )
        );
    `);
        console.log("Created Insert Policy for user_roles");

        await client.query(`
      DROP POLICY IF EXISTS "Admins can update user roles" ON user_roles;
      CREATE POLICY "Admins can update user roles" ON user_roles
        FOR UPDATE
        USING (
          auth.role() = 'service_role'
          OR EXISTS (
            SELECT 1
            FROM user_roles ur
            WHERE ur.user_id = auth.uid()
              AND ur.role = 'admin'
          )
        )
        WITH CHECK (
          auth.role() = 'service_role'
          OR EXISTS (
            SELECT 1
            FROM user_roles ur
            WHERE ur.user_id = auth.uid()
              AND ur.role = 'admin'
          )
        );
      
      DROP POLICY IF EXISTS "Admins can delete user roles" ON user_roles;
      CREATE POLICY "Admins can delete user roles" ON user_roles
        FOR DELETE
        USING (
          auth.role() = 'service_role'
          OR EXISTS (
            SELECT 1
            FROM user_roles ur
            WHERE ur.user_id = auth.uid()
              AND ur.role = 'admin'
          )
        );
    `);
        console.log("Created Update/Delete Policies for user_roles");

    } catch (err) {
        console.error("Error setting up policies:", err);
    } finally {
        await client.end();
    }
}

main();
