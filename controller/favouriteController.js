import bookModel from "../models/bookModel.js";
import userModel from "../models/userModel.js";

// ====================== ADD BOOK TO FAVOURITE ======================
export const addBookToFavourite = async (req, res) => {
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

  
      const isFavouriteBookExist = user.favourites.includes(bookid);
      if (isFavouriteBookExist) {
        return res.status(409).json({
          success: false,
          message: "Book is already in favourites",
        });
      }
  
      await userModel.findByIdAndUpdate(id, { $push: { favourites: bookid } });
  
      return res.status(200).json({
        success: true,
        message: "Book added to favourites",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Something went wrong. Please try again.",
      });
    }
  };

  // ====================== REMOVE BOOK FROM FAVOURITE ======================
  
  export const deleteBookFromFavourite = async (req, res) => {
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
  
      const isFavouriteBookExist = user.favourites.includes(bookid);
      if (!isFavouriteBookExist) {
        return res.status(409).json({
          success: false,
          message: "Book is not in favourites",
        });
      }
  
      await userModel.findByIdAndUpdate(id, { $pull: { favourites: bookid } });
  
      return res.status(200).json({
        success: true,
        message: "Book removed from favourites",
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  };

// ====================== GET FAVOURITE BOOK OF PARTICULAR USER ======================
  export const getFavouriteBook = async(req, res)=>{
    try{
        const {id} = req.headers;

        const user = await userModel.findById(id).populate("favourites")
        if(!user){
            return res.status(404).json({
                success: false,
                message: 'User not found',
              });
        }

        const favouritesBooks = user.favourites;
        return res.status(200).json({
            success: true,
            data:favouritesBooks
          });

       
    }
    catch(error){
      return res.status(500).json({ success: false, message: error.message });
    }
}

// ====================== FETCH USER FAVOURITE BOOK IDS ======================

export const getUserFavouriteIds = async (req, res) => {
  try {
    const { id } = req.headers;

    const user = await userModel.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      favourites: user.favourites, // Just book IDs
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
