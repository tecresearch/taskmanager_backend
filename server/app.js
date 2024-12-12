const express=require('express');
const app=express();
require("./connection/connection");

require('dotenv').config(); // Load environment variables
const PORT=process.env.PORT || 8080;
const cors=require("cors");
const UserApi=require("./routes/user");
const TaskApi=require("./routes/task");
app.use(cors());
app.use(express.json());
//custom midleware for debuging
app.use((req, res, next) => {
    console.log('Request received:', req.method, req.url);
    next();
  });
 


//setting up the register api routes
app.use("/api/v1/", UserApi);
app.use("/api/v2/", TaskApi);
app.listen(PORT,()=>{
    console.log("Server is running on port : "+PORT);
})

