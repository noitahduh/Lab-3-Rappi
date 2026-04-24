import { Request, Response } from 'express'
import Boom from '@hapi/boom'
import {
  createOrderService,
  getOrdersByConsumerService,
  getOrdersByStoreService,
  getOrderItemsService,
  getOrderByIdService,
  updateDeliveryPositionService
} from './orders.service'

export const createOrderController = async (req: Request, res: Response) => {
  const { consumerId, storeId, items, destinationLat, destinationLng } = req.body
  if (!consumerId) throw Boom.badRequest('consumerId is required')
  if (!storeId) throw Boom.badRequest('storeId is required')
  if (!items || !items.length) throw Boom.badRequest('items are required')
  if (destinationLat == null || destinationLng == null)
    throw Boom.badRequest('destination coordinates are required')

  const order = await createOrderService(consumerId, storeId, items, destinationLat, destinationLng)
  return res.status(201).json(order)
}

export const getOrderByIdController = async (req: Request, res: Response) => {
  const orderId = req.params.orderId as string
  const order = await getOrderByIdService(orderId)
  if (!order) throw Boom.notFound('Order not found')
  return res.json(order)
}

export const updateDeliveryPositionController = async (req: Request, res: Response) => {
  const orderId = req.params.orderId as string
  const { lat, lng } = req.body
  if (lat == null || lng == null) throw Boom.badRequest('lat and lng are required')

  const result = await updateDeliveryPositionService(orderId, lat, lng)
  return res.json(result)
}

export const getOrdersByConsumerController = async (req: Request, res: Response) => {
  const consumerId = req.params.consumerId as string
  const orders = await getOrdersByConsumerService(consumerId)
  return res.json(orders)
}

export const getOrdersByStoreController = async (req: Request, res: Response) => {
  const storeId = req.params.storeId as string
  const orders = await getOrdersByStoreService(storeId)
  return res.json(orders)
}

export const getOrderItemsController = async (req: Request, res: Response) => {
  const orderId = req.params.orderId as string
  const items = await getOrderItemsService(orderId)
  return res.json(items)
}