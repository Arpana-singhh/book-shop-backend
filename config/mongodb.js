import mongoose from 'mongoose'

const MONGO_URL = process.env.MONGODB_URI


 const connectDB=()=>{
    mongoose.connection.on('connected', ()=>console.log('Database Connected'))


    mongoose.connect(MONGO_URL, {
       useNewUrlParser: true,
       useUnifiedTopology: true
     })
 }

 export default connectDB;
