import { Router } from 'express'
import {
  getAvailableOrdersController,
  acceptOrderController,
  getMyOrdersController
} from './delivery.controller'

const router = Router()

router.get('/available', getAvailableOrdersController)
router.patch('/:orderId/accept', acceptOrderController)
router.get('/my-orders/:deliveryId', getMyOrdersController)

export default router