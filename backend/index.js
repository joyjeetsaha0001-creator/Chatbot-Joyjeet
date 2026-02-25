import  express from 'express';
import dotenv from "dotenv";
import mongoose, { connect } from "mongoose";
import chatbotRoutes from "./routes/chatbot.route.js";
import cors from "cors";


const app = express();
dotenv.config();


//Middle wares



const port =  process.env.PORT || 4002 ;


app.use(express.json());
app.use(cors());






//Database connection code
try{
    mongoose.connect(process.env.MONGODBURL)
    console.log("Mongodb connected succesfully")
}
catch(error){
    console.log("Error connecting to MongoDb",error)
}



//Defining routes
app.use("/bot/v1",chatbotRoutes)

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Chatbot app listening on port ${port}`)
})
