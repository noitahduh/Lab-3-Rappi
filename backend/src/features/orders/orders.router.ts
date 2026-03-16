import { Router } from 'express'
import {
  createOrderController,
  getOrdersByConsumerController,
  getOrdersByStoreController,
  getOrderItemsController
} from './orders.controller'

export const router = Router()

router.post('/', createOrderController)
router.get('/consumer/:consumerId', getOrdersByConsumerController)
router.get('/store/:storeId', getOrdersByStoreController)
router.get('/:orderId/items', getOrderItemsController)