import { Request, Response } from 'express'
import Boom from '@hapi/boom'
import {
  getStoresService,
  getStoreByUserIdService,
  toggleStoreService,
  createProductService,
  getProductsByStoreService
} from './stores.service'

export const getStoresController = async (req: Request, res: Response) => {
  const stores = await getStoresService()
  return res.json(stores)
}

export const getStoreByUserController = async (req: Request, res: Response) => {
  const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId
  const store = await getStoreByUserIdService(userId)
  if (!store) throw Boom.notFound('Store not found')
  return res.json(store)
}

export const toggleStoreController = async (req: Request, res: Response) => {
  const storeId = Array.isArray(req.params.storeId) ? req.params.storeId[0] : req.params.storeId
  const { isOpen } = req.body
  if (isOpen === undefined) throw Boom.badRequest('isOpen is required')
  const store = await toggleStoreService(storeId, isOpen)
  return res.json(store)
}

export const createProductController = async (req: Request, res: Response) => {
  const storeId = Array.isArray(req.params.storeId) ? req.params.storeId[0] : req.params.storeId
  const { name, price } = req.body
  if (!name) throw Boom.badRequest('Name is required')
  if (!price) throw Boom.badRequest('Price is required')
  const product = await createProductService(storeId, name, price)
  return res.status(201).json(product)
}

export const getProductsByStoreController = async (req: Request, res: Response) => {
  const storeId = Array.isArray(req.params.storeId) ? req.params.storeId[0] : req.params.storeId
  const products = await getProductsByStoreService(storeId)
  return res.json(products)
}