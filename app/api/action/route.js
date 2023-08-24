import { MongoClient } from "mongodb";
import { NextResponse } from "next/server";

export async function POST(request) {

  let { action, name, initialQuantity } = await request.json()


  const uri = "mongodb+srv://mongodb:Nfk93X1SVL3WUNJZ@cluster0.9en5ghq.mongodb.net/"; // Replace with your MongoDB Atlas connection string

  const client = new MongoClient(uri);

  try {
    const database = client.db('stock'); // Replace with your database name
    const data = database.collection('data');
    // create a filter for a movie to update
    const filter = { name: name };

    // create a document that sets the plot of the movie
    let newQuantity = action == "plus" ? (parseInt(initialQuantity) + 1) : (parseInt(initialQuantity) - 1)
    const updateDoc = {
      $set: {
        quantity: newQuantity
      },
    };
    const result = await data.updateOne(filter, updateDoc, {});

    return NextResponse.json({ success: true, message: `${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)` })
  } finally {
    await client.close();
  }
}





