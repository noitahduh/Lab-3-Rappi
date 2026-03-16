import { Router } from 'express'
import {
  getStoresController,
  getStoreByUserController,
  toggleStoreController,
  createProductController,
  getProductsByStoreController
} from './stores.controller'

export const router = Router()

router.get('/', getStoresController)
router.get('/user/:userId', getStoreByUserController)
router.patch('/:storeId/toggle', toggleStoreController)
router.post('/:storeId/products', createProductController)
router.get('/:storeId/products', getProductsByStoreController)