import { Router } from 'express'
import {
  createOrderController,
  getOrdersByConsumerController,
  getOrdersByStoreController,
  getOrderItemsController,
  getOrderByIdController,
  updateDeliveryPositionController
} from './orders.controller'

export const router = Router()

router.post('/', createOrderController)
router.get('/consumer/:consumerId', getOrdersByConsumerController)
router.get('/store/:storeId', getOrdersByStoreController)
router.patch('/:orderId/position', updateDeliveryPositionController)
router.get('/:orderId/items', getOrderItemsController)
router.get('/:orderId', getOrderByIdController)