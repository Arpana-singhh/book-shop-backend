import express from 'express'
import {addBookToFavourite, deleteBookFromFavourite, getFavouriteBook, getUserFavouriteIds} from '../controller/favouriteController.js'
import  {authenticateToken} from '../middleware/userAuth.js'
const favBookRoutes =express.Router();


favBookRoutes.put('/add-book-to-favourite',authenticateToken, addBookToFavourite)
favBookRoutes.put('/remove-book-from-favourite',authenticateToken, deleteBookFromFavourite)
favBookRoutes.get('/get-favourite-book',authenticateToken, getFavouriteBook)
favBookRoutes.get('/get-favourite-book-id',authenticateToken, getUserFavouriteIds)


export default favBookRoutes;

