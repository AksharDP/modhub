import { NextResponse } from "next/server";
import { db } from "@/app/db";
import { categories } from "@/app/db/schema";
import { asc } from "drizzle-orm";

export async function GET() {
    try {
        const categoriesData = await db
            .select({
                id: categories.id,
                name: categories.name,
                slug: categories.slug,
                description: categories.description,
                color: categories.color,
            })
            .from(categories)
            .orderBy(asc(categories.name));

        return NextResponse.json({
            categories: categoriesData,
        });
    } catch (error) {
        console.error("Error fetching categories:", error);
        return NextResponse.json(
            { error: "Failed to fetch categories" },
            { status: 500 }
        );
    }
}
