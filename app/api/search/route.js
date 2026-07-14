import { MongoClient } from "mongodb";
import { NextResponse } from "next/server";

export async function GET(request) {
    const query = request.nextUrl.searchParams.get("query")

    const uri = process.env.MONGODB_URI;

    const client = new MongoClient(uri);

    try {
        const database = client.db('stock'); // Replace with your database name
        const data = database.collection('data'); // Replace with your collection name


        const products = await data.aggregate([
            {
                $match: {
                    $or: [
                        { name: { $regex: query, $options: "i" } },
                    ]
                }
            }

        ]).toArray()
        return NextResponse.json({ success: true, products });
    } finally {
        await client.close();
    }
}
