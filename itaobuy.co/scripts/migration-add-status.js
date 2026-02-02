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

        // Add status column if it doesn't exist
        await client.query(`
      DO $$
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='finds' AND column_name='status') THEN
              ALTER TABLE finds ADD COLUMN status TEXT DEFAULT 'published';
              UPDATE finds SET status = 'published';
              RAISE NOTICE 'Added status column';
          ELSE
              RAISE NOTICE 'Status column already exists';
          END IF;
      END
      $$;
    `);

        console.log("Migration complete: Added 'status' column to 'finds' table.");

    } catch (err) {
        console.error("Error running migration:", err);
    } finally {
        await client.end();
    }
}

main();
