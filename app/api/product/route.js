import { MongoClient } from "mongodb";
import { NextResponse } from "next/server";

export async function GET(request) {
    const uri = process.env.MONGODB_URI;
    // No database configured -> return an empty stock so the UI still renders.
    if (!uri) {
        return NextResponse.json({ success: true, products: [] });
    }

    const client = new MongoClient(uri);

    try {
        const database = client.db('stock'); // Replace with your database name
        const data = database.collection('data'); // Replace with your collection name

        const query = {}; // You can specify a query here if needed
        const products = await data.find(query).toArray();
        return NextResponse.json({ success: true, products });
    } finally {
        await client.close();
    }
}

export async function POST(request) {

    let body = await request.json()
    console.log(body)
    const uri = process.env.MONGODB_URI;
    const client = new MongoClient(uri);

    try {

        const database = client.db('stock'); // Replace with your database name
        const data = database.collection('data'); // Replace with your collection name
        const product = await data.insertOne(body);
        return NextResponse.json({ product, ok: true });
    } finally {

        await client.close();
    }
}
