import express from 'express'
import {getAllOrders, getOrderHistory, placeOrder, updateOrderStatus} from '../controller/orderController.js'
import  {authenticateToken} from '../middleware/userAuth.js'
const orderRoutes =express.Router();


orderRoutes.post('/place-order',authenticateToken, placeOrder)
orderRoutes.get('/get-order-history',authenticateToken, getOrderHistory)
orderRoutes.get('/get-all-orders',authenticateToken, getAllOrders)
orderRoutes.post('/update-status/:id',authenticateToken, updateOrderStatus)

export default orderRoutes;
