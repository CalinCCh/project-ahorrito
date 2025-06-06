require("dotenv").config({ path: ".env.local" });
const { neon } = require("@neondatabase/serverless");

async function checkIconColumn() {
  const sql = neon(process.env.DATABASE_URL);

  try {
    console.log("Checking if icon column exists...");
    const result = await sql`SELECT icon FROM predefined_categories LIMIT 1`;
    console.log("✅ Icon column exists!", result);
  } catch (error) {
    console.log("❌ Icon column does not exist:", error.message);

    // Try to add the column
    try {
      console.log("Attempting to add icon column...");
      await sql`ALTER TABLE predefined_categories ADD COLUMN icon TEXT`;
      console.log("✅ Icon column added successfully!");
    } catch (addError) {
      console.log("Error adding column:", addError.message);
    }
  }
}

checkIconColumn().catch(console.error);
