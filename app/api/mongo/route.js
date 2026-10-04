import { MongoClient } from "mongodb";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request) {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        return NextResponse.json({ success: true, message: "No database configured" });
    }

    const client = new MongoClient(uri);

    try {
        const database = client.db('Dharamveer');
        const movies = database.collection('data');

        // Query for a movie that has the title 'Back to the Future' 
        const query = {  };
        const movie = await movies.find(query).toArray();

        console.log(movie);
        return NextResponse.json({ "a": 34, movie })
    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    } finally {
        await client.close();
    }
}