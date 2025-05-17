import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' }); // Ensure environment variables are loaded

import { predefinedCategories } from "../db/schema"; // Assuming schema.ts is in the parent db directory
import { db } from "@/db/drizzle"; // Your Drizzle DB instance

export type PredefinedCategorySeed = typeof predefinedCategories.$inferInsert;

export const defaultPredefinedCategories: PredefinedCategorySeed[] = [
  { id: "cat_income", name: "Income", emoji: "💰" },
  { id: "cat_housing", name: "Housing", emoji: "🏠" },
  { id: "cat_utilities", name: "Utilities", emoji: "💡" },
  { id: "cat_food", name: "Food", emoji: "🍽️" },
  { id: "cat_groceries", name: "Groceries", emoji: "🛒" },
  { id: "cat_transport", name: "Transport", emoji: "🚌" },
  { id: "cat_vehicle", name: "Vehicle", emoji: "🚗" },
  { id: "cat_health", name: "Health", emoji: "❤️‍🩹" },
  { id: "cat_shopping", name: "Shopping", emoji: "🛍️" },
  { id: "cat_entertainment", name: "Entertainment", emoji: "🎭" },
  { id: "cat_communication", name: "Communication", emoji: "📱" },
  { id: "cat_education", name: "Education", emoji: "🎓" },
  { id: "cat_family", name: "Family", emoji: "👨‍👩‍👧‍👦" },
  { id: "cat_gifts", name: "Gifts", emoji: "🎁" },
  { id: "cat_travel", name: "Travel", emoji: "✈️" },
  { id: "cat_savings", name: "Savings", emoji: "🏦" },
  { id: "cat_investments", name: "Investments", emoji: "📈" },
  { id: "cat_taxes", name: "Taxes", emoji: "🧾" },
  { id: "cat_fees", name: "Fees", emoji: "💸" },
  { id: "cat_pets", name: "Pets", emoji: "🐾" },
  { id: "cat_donations", name: "Donations", emoji: "🙏" },
  { id: "cat_insurance", name: "Insurance", emoji: "🛡️" },
  { id: "cat_business", name: "Business", emoji: "💼" },
  { id: "cat_home", name: "Home", emoji: "🛋️" },
  { id: "cat_childcare", name: "Childcare", emoji: "🧸" },
  { id: "cat_personal_care", name: "Personal Care", emoji: "🧴" },
  { id: "cat_subscriptions", name: "Subscriptions", emoji: "🔔" },
  { id: "cat_hobbies", name: "Hobbies", emoji: "🎨" },
  { id: "cat_furniture", name: "Furniture", emoji: "🪑" },
  { id: "cat_clothing", name: "Clothing", emoji: "👕" },
  { id: "cat_electronics", name: "Electronics", emoji: "💻" },
  { id: "cat_beauty", name: "Beauty", emoji: "💅" },
  { id: "cat_sports", name: "Sports", emoji: "🏀" },
  { id: "cat_events", name: "Events", emoji: "🎫" },
  { id: "cat_maintenance", name: "Maintenance", emoji: "🛠️" },
  { id: "cat_emergency", name: "Emergency", emoji: "🚨" },
  { id: "cat_relations", name: "Relationships", emoji: "💑" },
  { id: "cat_legal", name: "Legal", emoji: "⚖️" },
  { id: "cat_misc", name: "Miscellaneous", emoji: "🗂️" },
  { id: "cat_other", name: "Other", emoji: "🤷" },
];

async function seed() {
  console.log("⏳ Seeding predefined categories...");

  try {
    // To replace existing categories, first delete all of them
    console.log("🗑️ Deleting existing predefined categories (if any)...");
    await db.delete(predefinedCategories); // This will delete all rows
    console.log("✅ Existing predefined categories deleted.");

    console.log("➕ Inserting new predefined categories...");
    await db.insert(predefinedCategories).values(defaultPredefinedCategories);

    console.log("🎉 Seeding finished successfully!");

  } catch (err) {
    console.error("❌ Error during seeding:", err);
    process.exit(1);
  } finally {
    // Ensure the script exits, regardless of success or failure in the try block
    // If there was an error, process.exit(1) would have already been called.
    // If successful, we exit with 0.
    if (process.exitCode === undefined || process.exitCode === 0) {
      process.exit(0);
    }
  }
}

seed();
