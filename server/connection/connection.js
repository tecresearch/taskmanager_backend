const mongoose =require('mongoose');
require('dotenv').config(); // Load environment variables
const DB_URL=process.env.MONGO_URL ;//get URI
const connection=async()=>{
    try{
       const response= await mongoose.connect(DB_URL);
       if(!response){
        console.log("Failed to connect")
       }
        console.log("Connected to MongoDB");
    }catch(err){
    console.log(err);
    }
}

connection();