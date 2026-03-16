import { Request, Response } from 'express'
import Boom from '@hapi/boom'
import {
  getAvailableOrdersForDeliveryService,
  acceptOrderForDeliveryService,
  getMyOrdersDeliveryService
} from './delivery.service'

export const getAvailableOrdersController = async (req: Request, res: Response) => {
  const orders = await getAvailableOrdersForDeliveryService()
  return res.json(orders)
}

export const acceptOrderController = async (req: Request, res: Response) => {
  const orderIdRaw = req.params.orderId
  if (!orderIdRaw || Array.isArray(orderIdRaw)) throw Boom.badRequest('orderId is required')
  const orderId = orderIdRaw

  const deliveryIdRaw = req.body.deliveryId
  if (!deliveryIdRaw || Array.isArray(deliveryIdRaw)) throw Boom.badRequest('deliveryId is required')
  const deliveryId = deliveryIdRaw

  const order = await acceptOrderForDeliveryService(orderId, deliveryId)
  return res.json(order)
}

export const getMyOrdersController = async (req: Request, res: Response) => {
  const deliveryIdRaw = req.params.deliveryId
  if (!deliveryIdRaw || Array.isArray(deliveryIdRaw)) throw Boom.badRequest('deliveryId is required')
  const deliveryId = deliveryIdRaw

  const orders = await getMyOrdersDeliveryService(deliveryId)
  return res.json(orders)
}