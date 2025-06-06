import { db } from "../db/drizzle";
import { predefinedCategories } from "../db/schema";
import { eq } from "drizzle-orm";

async function updatePetIcons() {
    try {
        console.log("Updating PetPaw icons to Cat...");

        const result = await db
            .update(predefinedCategories)
            .set({ icon: "Cat" })
            .where(eq(predefinedCategories.icon, "PetPaw"));

        console.log("Successfully updated pet icons!");
        console.log("Result:", result);

        // Verify the update
        const petsCategory = await db
            .select()
            .from(predefinedCategories)
            .where(eq(predefinedCategories.name, "Pets"));

        console.log("Pets category after update:", petsCategory);

    } catch (error) {
        console.error("Error updating pet icons:", error);
    }
}

updatePetIcons();
