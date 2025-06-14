import { db } from "@/app/db";
import { games, categories } from "@/app/db/schema";

export async function getGamesAndCategories() {
    const gamesList = await db.select({ id: games.id, name: games.name }).from(games);
    const categoriesList = await db.select({ id: categories.id, name: categories.name }).from(categories);
    return { games: gamesList, categories: categoriesList };
}
