import express from 'express'
import {addBook, bookDetails, deleteBook, getAllBooks, getRecentBook, updateBook} from '../controller/adminBookController.js'
import  {authenticateToken} from '../middleware/userAuth.js'
const adminBookRoutes =express.Router();


adminBookRoutes.post('/add-book',authenticateToken, addBook)
adminBookRoutes.put('/update-book',authenticateToken, updateBook)
adminBookRoutes.delete('/delete-book',authenticateToken, deleteBook)
adminBookRoutes.get('/get-all-book', getAllBooks)
adminBookRoutes.get('/get-recent-book',  getRecentBook)
adminBookRoutes.get('/book-detail/:id',  bookDetails )

export default adminBookRoutes

 