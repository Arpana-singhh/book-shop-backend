import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
    {
        username:{
            type:String, 
            required:true,
            unique:true
        },
        email:{
            type:String,
            required:true,
            unique:true
        },
        password:{
            type:String,
            required:true 
        },
        address:{
            type:String,
            required:true
        },
        verifyOtp:{
            type:String,
            default:'',
        },
        verifyOtpExpireAt:{
             type:Number,
             default:0
        },
        isAccountVerified:{
            type:Boolean, 
            default:false
        },

        resetOtp:{
          type:String,
          default:''
        },
        resetOtpExpireAt:{
            type:Number,
            default:0
        },
      
        avatar:{
            type:String,
            default:"https://cdn-icons-png.flaticon.com/512/149/149071.png"
        },
        role:{
            type:String,
            default:"user",
            enum:["user", "admin"]
        },
        favourites: [{
            type: mongoose.Types.ObjectId,
            ref: 'book'
        }],

        // cart: [{
        // type: mongoose.Types.ObjectId,
        // ref: 'book'
        // }],
        cart: [{
            book: {
              type: mongoose.Types.ObjectId,
              ref: 'book'
            },
            quantity: {
              type: Number,
              default: 1
            }
          }],
          
          
        order: [{
        type: mongoose.Types.ObjectId,
        ref: 'order'
        }],
    },
    {timestamps:true}
)
const userModel=mongoose.models.user || mongoose.model('user', userSchema)
export default userModel;
