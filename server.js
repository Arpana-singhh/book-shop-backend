import express from "express";
import 'dotenv/config'
import cors from 'cors';
import connectDB from "./config/mongodb.js";
import authRouter from './routes/authRoutes.js'
import adminBookRouter from './routes/adminBookRoutes.js'
import favBookRouter from './routes/favouriteRoute.js'
import cartRouter from './routes/cartRoutes.js'
import orderRouter from './routes/orderRoute.js'
import transporter from './config/nodemailer.js'

const app=express();
const port=process.env.PORT || 4000
connectDB();

const allowedOrigins =['http://localhost:5173']
app.use(cors({allowedOrigins}))
app.use(express.json())
app.use('/api/auth', authRouter)
app.use('/api/auth', adminBookRouter)
app.use('/api/auth', favBookRouter)
app.use('/api/auth', cartRouter)
app.use('/api/auth', orderRouter)

app.get('/', (req, res)=>{
    res.send('Server is Running')
})

app.get('/test-email', async (req, res) => {
    try {
      const info = await transporter.sendMail({
        from: `Book Store <${process.env.SENDER_EMAIL}>`,
        to: 'nainusingh4013@gmail.com',
        subject: 'Test Email',
        text: 'Hello Hello',
      });
      console.log('✅ Email sent:', info);
      res.send('Sent! Info: ' + JSON.stringify(info));
    } catch (err) {
      console.log('❌ Email Error:', err);
      res.status(500).send('Failed to send: ' + err.message);
    }
  });
  

app.listen(port, ()=>{
    console.log(`Server is running on ${port} `)

})
 
