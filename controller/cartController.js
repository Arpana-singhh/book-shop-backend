import bookModel from "../models/bookModel.js";
import userModel from "../models/userModel.js";

// ====================== ADD BOOK TO CART  ======================
export const addBookToCart = async (req, res) => {
    try {
      const { id, bookid } = req.headers;
  
      const user = await userModel.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      const book = await bookModel.findById(bookid);
      if (!book) {
        return res.status(404).json({
          success: false,
          message: 'Book not found',
        });
      }

      // const isBookInCart = user.cart.includes(bookid);
      const isBookInCart = user.cart?.find(
        item => item?.book?.toString() === bookid
      );
  
  

      if (isBookInCart) {
        return res.status(409).json({
          success: false,
          message: "Book is already in Cart",
        });
      }
  
      // await userModel.findByIdAndUpdate(id, { $push: { cart: bookid } });
      await userModel.findByIdAndUpdate(id, {
        $push: { cart: { book: bookid, quantity: 1 } }
      });
  
  
      return res.status(200).json({
        success: true,
        message: "Book added to Cart",
      });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
  };

  // ====================== REMOVE BOOK FROM CART  ======================

  export const removeBookFromCart = async (req, res) => {
    try {
      const { id, bookid } = req.headers;
  
      const user = await userModel.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }
  
      const book = await bookModel.findById(bookid);
      if (!book) {
        return res.status(404).json({
          success: false,
          message: 'Book not found',
        });
      }
  
      const isBookInCart = user.cart.find(item => item.book.toString() === bookid);
      if (!isBookInCart) {
        return res.status(409).json({
          success: false,
          message: "Book is not in cart",
        });
      }
  
      await userModel.findByIdAndUpdate(id, {
        $pull: { cart: { book: bookid } }  
      });
  
      return res.status(200).json({
        success: true,
        message: "Book removed from Cart",
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  };
  
  
  
    // ====================== GET BOOK ADDED TO THE CART BY PARTICULAR USER  ======================
    export const getCartBook = async(req, res)=>{
      try{
          const {id} = req.headers;
  
          const user = await userModel.findById(id).populate({
            path: "cart.book",
            model: "book"
          });
          // const user = await userModel.findById(id).populate("cart.book");

          if(!user){
              return res.status(404).json({
                  success: false,
                  message: 'User not found',
                });
          }
  
          const cartBooks = user.cart;
          return res.status(200).json({
              success: true,
              data:cartBooks
            });
  
         
      }
      catch(error){
        return res.status(500).json({ success: false, message: error.message });
      }
  }
    


  export const updateCartQuantity = async (req, res) => {
    try {
      const { id, bookid } = req.headers;
      const { quantity } = req.body;
  
      // Validate user
      const user = await userModel.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }
  
      // Validate quantity
      if (isNaN(quantity) || quantity < 1) {
        return res.status(400).json({
          success: false,
          message: "Quantity must be a number greater than 0"
        });
      }
  
      // Find index of the book in cart
      const cartItemIndex = user.cart.findIndex(
        item => item.book.toString() === bookid
      );
  
      if (cartItemIndex === -1) {
        return res.status(404).json({
          success: false,
          message: "Book not found in cart"
        });
      }
  
      // Update quantity
      user.cart[cartItemIndex].quantity = quantity;
      await user.save();
  
      // Populate and return updated cart
      const updatedUser = await userModel.findById(id).populate("cart.book");
  
      return res.status(200).json({
        success: true,
        message: "Cart quantity updated successfully",
        data: updatedUser.cart
      });
  
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };
  