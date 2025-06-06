import { db } from "../db/drizzle";
import { predefinedCategories } from "../db/schema";

async function checkAllIcons() {
    try {
        console.log("Checking all category icons...");

        const categories = await db
            .select()
            .from(predefinedCategories)
            .orderBy(predefinedCategories.name);

        console.log("Categories with icons:");
        categories.forEach(cat => {
            console.log(`${cat.name}: ${cat.icon || 'No icon'}`);
        });

    } catch (error) {
        console.error("Error checking icons:", error);
    }
}

checkAllIcons();
