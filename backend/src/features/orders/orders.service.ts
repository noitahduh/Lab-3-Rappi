import sql from '../../db'
import { OrderItem } from './orders.types'

export const createOrderService = async (
  consumerId: string,
  storeId: string,
  items: OrderItem[]
) => {
  const orderId = crypto.randomUUID()

  const [order] = await sql`
    INSERT INTO orders (id, "consumerId", "storeId", status)
    VALUES (${orderId}, ${consumerId}, ${storeId}, 'pending')
    RETURNING *
  `

  for (const item of items) {
    const itemId = crypto.randomUUID()
    await sql`
      INSERT INTO order_items (id, "orderId", "productId", quantity)
      VALUES (${itemId}, ${orderId}, ${item.productId}, ${item.quantity})
    `
  }

  return order
}

export const getOrdersByConsumerService = async (consumerId: string) => {
  return await sql`
    SELECT o.*, s.name as "storeName"
    FROM orders o
    JOIN stores s ON o."storeId" = s.id
    WHERE o."consumerId" = ${consumerId}
    ORDER BY o."createdAt" DESC
  `
}

export const getOrdersByStoreService = async (storeId: string) => {
  return await sql`
    SELECT * FROM orders
    WHERE "storeId" = ${storeId}
    ORDER BY "createdAt" DESC
  `
}

export const getAvailableOrdersService = async () => {
  return await sql`
    SELECT o.*, s.name as "storeName"
    FROM orders o
    JOIN stores s ON o."storeId" = s.id
    WHERE o.status = 'pending' AND o."deliveryId" IS NULL
    ORDER BY o."createdAt" DESC
  `
}

export const acceptOrderService = async (orderId: string, deliveryId: string) => {
  const [order] = await sql`
    UPDATE orders
    SET "deliveryId" = ${deliveryId}, status = 'accepted'
    WHERE id = ${orderId} AND status = 'pending'
    RETURNING *
  `
  if (!order) throw new Error('Order not available')
  return order
}

export const getOrdersByDeliveryService = async (deliveryId: string) => {
  return await sql`
    SELECT o.*, s.name as "storeName"
    FROM orders o
    JOIN stores s ON o."storeId" = s.id
    WHERE o."deliveryId" = ${deliveryId}
    ORDER BY o."createdAt" DESC
  `
}

export const getOrderItemsService = async (orderId: string) => {
  return await sql`
    SELECT oi.*, p.name as "productName", p.price
    FROM order_items oi
    JOIN products p ON oi."productId" = p.id
    WHERE oi."orderId" = ${orderId}
  `
}