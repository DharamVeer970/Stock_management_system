import { MongoClient } from "mongodb";
import { NextResponse } from "next/server";

export async function GET(request) {
    const uri = "mongodb+srv://mongodb:Nfk93X1SVL3WUNJZ@cluster0.9en5ghq.mongodb.net/"; // Replace with your MongoDB Atlas connection string

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
    const uri = "mongodb+srv://mongodb:Nfk93X1SVL3WUNJZ@cluster0.9en5ghq.mongodb.net/"; // Replace with your MongoDB Atlas connection string
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
