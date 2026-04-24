import sql from '../../db'
import { supabase } from '../../config/supabase'
import { OrderItem, OrderStatus } from './orders.types'

export const createOrderService = async (
  consumerId: string,
  storeId: string,
  items: OrderItem[],
  destinationLat: number,
  destinationLng: number
) => {
  const orderId = crypto.randomUUID()

  const [order] = await sql`
    INSERT INTO orders (id, "consumerId", "storeId", status, destination)
    VALUES (
      ${orderId}, ${consumerId}, ${storeId}, ${OrderStatus.CREATED},
      ST_SetSRID(ST_MakePoint(${destinationLng}, ${destinationLat}), 4326)
    )
    RETURNING id, "consumerId", "storeId", status, "createdAt"
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

export const getOrderByIdService = async (orderId: string) => {
  const [order] = await sql`
    SELECT
      id, "consumerId", "storeId", "deliveryId", status,
      ST_Y(delivery_position::geometry) as delivery_lat,
      ST_X(delivery_position::geometry) as delivery_lng,
      ST_Y(destination::geometry)       as destination_lat,
      ST_X(destination::geometry)       as destination_lng,
      "createdAt"
    FROM orders
    WHERE id = ${orderId}
  `
  return order
}

export const acceptOrderService = async (orderId: string, deliveryId: string) => {
  const [order] = await sql`
    UPDATE orders
    SET "deliveryId" = ${deliveryId}, status = ${OrderStatus.IN_DELIVERY}
    WHERE id = ${orderId} AND status = ${OrderStatus.CREATED}
    RETURNING *
  `
  if (!order) throw new Error('Order not available')
  return order
}

export const updateDeliveryPositionService = async (
  orderId: string,
  lat: number,
  lng: number
) => {
  const [result] = await sql`
    UPDATE orders
    SET delivery_position = ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)
    WHERE id = ${orderId}
    RETURNING
      id,
      status,
      ST_DWithin(
        ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
        destination,
        5
      ) as at_destination
  `

  if (!result) throw new Error('Order not found')

  let newStatus = result.status

  if (result.at_destination && result.status !== OrderStatus.DELIVERED) {
    await sql`
      UPDATE orders SET status = ${OrderStatus.DELIVERED} WHERE id = ${orderId}
    `
    newStatus = OrderStatus.DELIVERED
  }

  // Broadcast con httpSend + removeChannel — patrón del repo maps
  const channel = supabase.channel(`order:${orderId}`)
  await channel.httpSend('position-update', {
    lat,
    lng,
    status: newStatus
  })
  supabase.removeChannel(channel)

  return { ...result, status: newStatus }
}

export const getOrdersByConsumerService = async (consumerId: string) => {
  return await sql`
    SELECT
      o.id, o."consumerId", o."storeId", o."deliveryId", o.status,
      s.name as "storeName", o."createdAt"
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
    WHERE o.status = ${OrderStatus.CREATED} AND o."deliveryId" IS NULL
    ORDER BY o."createdAt" DESC
  `
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