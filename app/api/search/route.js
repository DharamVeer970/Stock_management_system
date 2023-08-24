import { MongoClient } from "mongodb";
import { NextResponse } from "next/server";

export async function GET(request) {
    const query = request.nextUrl.searchParams.get("query")

    const uri = "mongodb+srv://mongodb:Nfk93X1SVL3WUNJZ@cluster0.9en5ghq.mongodb.net/"; // Replace with your MongoDB Atlas connection string

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
