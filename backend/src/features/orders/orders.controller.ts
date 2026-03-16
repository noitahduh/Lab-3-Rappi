import { Request, Response } from 'express'
import Boom from '@hapi/boom'
import {
  createOrderService,
  getOrdersByConsumerService,
  getOrdersByStoreService,
  getOrderItemsService
} from './orders.service'

export const createOrderController = async (req: Request, res: Response) => {
  const { consumerId, storeId, items } = req.body
  if (!consumerId) throw Boom.badRequest('consumerId is required')
  if (!storeId) throw Boom.badRequest('storeId is required')
  if (!items || !items.length) throw Boom.badRequest('items are required')

  const order = await createOrderService(consumerId, storeId, items)
  return res.status(201).json(order)
}

export const getOrdersByConsumerController = async (req: Request, res: Response) => {
  const consumerIdRaw = req.params.consumerId
  if (!consumerIdRaw || Array.isArray(consumerIdRaw)) throw Boom.badRequest('consumerId is required')
  const consumerId = consumerIdRaw

  const orders = await getOrdersByConsumerService(consumerId)
  return res.json(orders)
}

export const getOrdersByStoreController = async (req: Request, res: Response) => {
  const storeIdRaw = req.params.storeId
  if (!storeIdRaw || Array.isArray(storeIdRaw)) throw Boom.badRequest('storeId is required')
  const storeId = storeIdRaw

  const orders = await getOrdersByStoreService(storeId)
  return res.json(orders)
}

export const getOrderItemsController = async (req: Request, res: Response) => {
  const orderIdRaw = req.params.orderId
  if (!orderIdRaw || Array.isArray(orderIdRaw)) throw Boom.badRequest('orderId is required')
  const orderId = orderIdRaw

  const items = await getOrderItemsService(orderId)
  return res.json(items)
}