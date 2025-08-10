import bookModel from "../models/bookModel.js";
import userModel from "../models/userModel.js";
import orderModel from "../models/orderModel.js";

//  ====================== PLACE ORDER  ======================
export const placeOrder = async (req, res) => {
    try {
      const { id } = req.headers;
      const { order } = req.body; // order = [{ _id: bookId, quantity: 2 }, ...]
  
      for (const orderItem of order) {
        const newOrder = new orderModel({
          user: id,
          book: orderItem._id,
          quantity: orderItem.quantity
        });
  
        const orderDataFromDb = await newOrder.save();
  
        // Push to user's order history
        await userModel.findByIdAndUpdate(id, {
          $push: { order: orderDataFromDb._id }
        });
  
        // Remove this book from user's cart
        await userModel.findByIdAndUpdate(id, {
          $pull: { cart: { book: orderItem._id } }
        });
      }
  
      return res.json({
        success: true,
        message: "Order Placed Successfully"
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  };
  

//  ====================== GET ORDER HISTORY OF PARTICULAR USER ======================

export const getOrderHistory = async(req, res)=>{
try{
    const {id} = req.headers;
    const user = await userModel.findById(id).populate({
     path:"order",
     populate:{
        path:"book"
     }
    })

    // const orderData = user.order.reverse();
    const orderData = [...user.order].reverse();
    return res.json({
        success:true,
        data:orderData
    })
}
catch(error) {
    return res.status(500).json({ success: false, message: error.message });
 }
}
//  ====================== GET ALL ORDERS ======================

export const getAllOrders = async(req, res)=>{
    try{
        const userData = await orderModel.find()
        .populate({
            path:"book"
        })
        .populate({
            path:"user"
        })
        .sort({createdAt:-1});
        return res.json({
            success:true,
            data:userData,
        })
    } 
    catch(error){
        return res.status(500).json({ success: false, message: error.message });
    }

}


//  ====================== UPDATE ORDER STATUS ======================
export const updateOrderStatus = async (req, res) => {
  const { status } = req.body;

  try {
    const orderId = req.params.id;
    const userId = req.headers.id; // headers are lowercase

    const user = await userModel.findById(userId);
    if (user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin Access Only. Access Denied",
      });
    }

    await orderModel.findByIdAndUpdate(orderId, { status }, { new: true });

    return res.json({
      success: true,
      message: "Status updated successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
