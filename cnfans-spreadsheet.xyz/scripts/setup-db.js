const { Client } = require('pg');

// Static data from lib/finds-source.ts (Manual copy for seeding)
const createItem = (id, name, cat0, cat1, price, image, brand = "Generic") => ({
    _id: id,
    name,
    price,
    image,
    link: "https://example.com",
    agentLinks: {
        kakobuy: "https://kakobuy.com/register",
        cnfans: "https://cnfans.com/register",
    },
    "category[0]": cat0,
    "category[1]": cat1,
    "category[2]": null,
    brand,
    batch: "Good Batch",
    view_count: Math.floor(Math.random() * 5000) + 100,
    created_by: "System",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    top: false,
});

const STATIC_DB = [
    createItem(1, "Classic Leather Sneakers", "Shoes", "Sneaker", 45, "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=600", "Nike"),
    createItem(2, "High Top Canvas", "Shoes", "Sneaker", 35, "https://images.unsplash.com/photo-1547053282-16983059da18?auto=format&fit=crop&q=80&w=600", "Converse"),
    createItem(3, "Winter Hiking Boots", "Shoes", "Boots", 89, "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=600", "Timberland"),
    createItem(4, "Summer Slides", "Shoes", "Slides", 25, "https://images.unsplash.com/photo-1621251399479-0524cb51b72e?auto=format&fit=crop&q=80&w=600", "Yeezy"),
    createItem(5, "Formal Loafers", "Shoes", "Loafers", 65, "https://images.unsplash.com/photo-1614252369475-531eba835eb1?auto=format&fit=crop&q=80&w=600", "Gucci"),
    createItem(6, "Running Performance", "Shoes", "Sports", 55, "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600", "Adidas"),
    createItem(7, "Vintage Wash T-Shirt", "Tops", "T-Shirts", 20, "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=600", "Balenciaga"),
    createItem(8, "Team Jersey", "Tops", "Jerseys", 30, "https://images.unsplash.com/photo-1577401239170-897941296695?auto=format&fit=crop&q=80&w=600", "Nike"),
    createItem(9, "Oversized Hoodie", "Tops", "Hoodies", 45, "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=600", "Essentials"),
    createItem(10, "Knitted Sweater", "Tops", "Sweaters", 40, "https://images.unsplash.com/photo-1620799140408-ed5341cd2431?auto=format&fit=crop&q=80&w=600", "Ralph Lauren"),
    createItem(11, "Straight Leg Jeans", "Bottoms", "Denim", 50, "https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?auto=format&fit=crop&q=80&w=600", "Levis"),
    createItem(12, "Tactical Cargos", "Bottoms", "Cargos", 45, "https://images.unsplash.com/photo-1517445312882-efe431d1d81f?auto=format&fit=crop&q=80&w=600", "Carhartt"),
    createItem(13, "Mesh Shorts", "Bottoms", "Shorts", 25, "https://images.unsplash.com/photo-1591195853246-bc5d36e2d935?auto=format&fit=crop&q=80&w=600", "Eric Emanuel"),
    createItem(14, "Grey Sweatpants", "Bottoms", "Sweatpants", 28, "https://images.unsplash.com/photo-1506629082955-511b1aa002c4?auto=format&fit=crop&q=80&w=600", "Nike"),
    createItem(15, "Puffer Jacket", "Jackets", "Jackets", 80, "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=600", "North Face"),
    createItem(16, "Light Windbreaker", "Jackets", "Windbreaker", 55, "https://images.unsplash.com/photo-1605763240004-7e93b172d754?auto=format&fit=crop&q=80&w=600", "Arc'teryx"),
    createItem(17, "Wool Cardigan", "Jackets", "Cardigan", 60, "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&q=80&w=600", "CDG"),
    createItem(18, "Utility Vest", "Jackets", "Vests", 40, "https://images.unsplash.com/photo-1624479383637-23b9d88562d9?auto=format&fit=crop&q=80&w=600", "Canada Goose"),
    createItem(19, "Leather Crossbody", "Accessories", "Bags", 120, "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=600", "Prada"),
    createItem(20, "Designer Belt", "Accessories", "Belts", 40, "https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&q=80&w=600", "LV"),
    createItem(21, "Baseball Cap", "Accessories", "Caps", 20, "https://images.unsplash.com/photo-1588850561407-ed78c282e89d?auto=format&fit=crop&q=80&w=600", "New Era"),
    createItem(22, "Sunglasses", "Accessories", "Glasses", 50, "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=600", "RayBan"),
    createItem(23, "Silver Chain", "Accessories", "Jewelry", 35, "https://images.unsplash.com/photo-1611085583191-a3b181a8840d?auto=format&fit=crop&q=80&w=600", "Chrome Hearts"),
    createItem(24, "Automatic Watch", "Accessories", "Watches", 200, "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=600", "Rolex"),
    createItem(25, "Travel Suitcase", "Accessories", "Suitcase", 150, "https://images.unsplash.com/photo-1565026057447-bccc886498a9?auto=format&fit=crop&q=80&w=600", "Rimowa"),
    createItem(26, "Bearbrick", "Decor", "Collectables", 80, "https://images.unsplash.com/photo-1533038590840-1cde6e668a91?auto=format&fit=crop&q=80&w=600", "Bearbrick"),
    createItem(27, "Technic Car", "Decor", "Lego", 90, "https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?auto=format&fit=crop&q=80&w=600", "Lego"),
    createItem(28, "Persian Rug", "Decor", "Rugs", 100, "https://images.unsplash.com/photo-1596295346083-d9d3090622a4?auto=format&fit=crop&q=80&w=600", "IKEA"),
    createItem(29, "Art Poster", "Decor", "Posters", 15, "https://images.unsplash.com/photo-1583702993545-19888d3d9e8d?auto=format&fit=crop&q=80&w=600", "Poster"),
    createItem(30, "Bluetooth Speaker", "Electronics", "Audio", 60, "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&q=80&w=600", "JBL"),
    createItem(31, "Gaming Controller", "Electronics", "Gaming", 45, "https://images.unsplash.com/photo-1600080972464-8cb002c9185f?auto=format&fit=crop&q=80&w=600", "Sony"),
    createItem(32, "Hair Dryer", "Electronics", "Hair", 120, "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?auto=format&fit=crop&q=80&w=600", "Dyson"),
    createItem(33, "Phone Case", "Electronics", "Other", 10, "https://images.unsplash.com/photo-1586105251261-72a756497a11?auto=format&fit=crop&q=80&w=600", "Casetify"),
];

async function main() {
    const connectionString = process.env.POSTGRES_URL;
    if (!connectionString) {
        console.error("Missing POSTGRES_URL env var");
        process.exit(1);
    }

    const client = new Client({
        connectionString,
        ssl: {
            rejectUnauthorized: false, // Required for Supabase in some environments / Node versions
        },
    });

    try {
        await client.connect();
        console.log("Connected to database");

        // Create table
        await client.query(`
      CREATE TABLE IF NOT EXISTS finds (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        price NUMERIC NOT NULL,
        image TEXT NOT NULL,
        link TEXT NOT NULL,
        marketplace TEXT,
        agent_links JSONB,
        category_0 TEXT,
        category_1 TEXT,
        category_2 TEXT,
        brand TEXT,
        batch TEXT,
        view_count INTEGER DEFAULT 0,
        temp_created_by TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        top BOOLEAN DEFAULT FALSE
      );
    `);
        console.log("Table 'finds' created (if not exists)");

        // Seed data
        for (const item of STATIC_DB) {
            // Check if exists
            const res = await client.query('SELECT id FROM finds WHERE id = $1', [item._id]);
            if (res.rows.length === 0) {
                await client.query(`
                INSERT INTO finds (
                    id, name, price, image, link, marketplace, 
                    agent_links, category_0, category_1, category_2, 
                    brand, batch, view_count, temp_created_by, created_at, updated_at, top
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, 
                    $7, $8, $9, $10, 
                    $11, $12, $13, $14, $15, $16, $17
                )
            `, [
                    item._id,
                    item.name,
                    item.price,
                    item.image,
                    item.link,
                    item.marketplace || null,
                    JSON.stringify(item.agentLinks || {}),
                    item["category[0]"] || null,
                    item["category[1]"] || null,
                    item["category[2]"] || null,
                    item.brand || null,
                    item.batch || null,
                    item.view_count || 0,
                    item.created_by || null,
                    item.created_at,
                    item.updated_at,
                    item.top || false
                ]);
                console.log(`Inserted item: ${item.name}`);
            } else {
                console.log(`Item already exists: ${item.name} (ID: ${item._id})`);
            }
        }

        // Reset sequence to max id to avoid conflicts on new inserts
        await client.query("SELECT setval(pg_get_serial_sequence('finds', 'id'), COALESCE(MAX(id), 1) + 1, false) FROM finds");
        console.log("Sequence reset complete");

    } catch (err) {
        console.error("Error setup database:", err);
    } finally {
        await client.end();
    }
}

main();
