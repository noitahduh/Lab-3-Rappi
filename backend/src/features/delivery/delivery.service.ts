import sql from '../../db'
import { acceptOrderService, getAvailableOrdersService, getOrdersByDeliveryService } from '../orders/orders.service'

export const getAvailableOrdersForDeliveryService = async () => {
  return await getAvailableOrdersService()
}

export const acceptOrderForDeliveryService = async (orderId: string, deliveryId: string) => {
  return await acceptOrderService(orderId, deliveryId)
}

export const getMyOrdersDeliveryService = async (deliveryId: string) => {
  return await getOrdersByDeliveryService(deliveryId)
}