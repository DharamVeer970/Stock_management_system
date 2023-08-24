import { MongoClient } from "mongodb";
import { NextResponse } from "next/server";

export async function GET(request) {



    // Replace the uri string with your connection string.
    const uri = "mongodb+srv://mongodb:Nfk93X1SVL3WUNJZ@cluster0.9en5ghq.mongodb.net/";

    const client = new MongoClient(uri);

    try {
        const database = client.db('Dharamveer');
        const movies = database.collection('data');

        // Query for a movie that has the title 'Back to the Future' 
        const query = {  };
        const movie = await movies.find(query).toArray;

        console.log(movie);
        return NextResponse.json({ "a": 34, movie })
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}









// db.data.aggregate([
// 	{
// 		$match: {
// 			$or:[
//                 {name : {$regex: "He", $options: "i"}},
//                 {quantity: {$regex: "Your_query_string", $options: "i"}},
//                 {price: {$regex: "Your_query_string", $options: "i"}}
//             ]
// 			}
// 		}
		
// ])