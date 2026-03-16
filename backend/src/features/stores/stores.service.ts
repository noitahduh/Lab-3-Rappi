import sql from '../../db'
import { v4 as uuidv4 } from 'uuid'

export const getStoresService = async () => {
  return await sql`SELECT * FROM stores`
}

export const getStoreByUserIdService = async (userId: string) => {
  const [store] = await sql`
    SELECT * FROM stores WHERE "userId" = ${userId}
  `
  return store
}

export const toggleStoreService = async (storeId: string, isOpen: boolean) => {
  const [store] = await sql`
    UPDATE stores SET "isOpen" = ${isOpen}
    WHERE id = ${storeId}
    RETURNING *
  `
  return store
}

export const createProductService = async (storeId: string, name: string, price: number) => {
  const id = uuidv4()
  const [product] = await sql`
    INSERT INTO products (id, name, price, "storeId")
    VALUES (${id}, ${name}, ${price}, ${storeId})
    RETURNING *
  `
  return product
}

export const getProductsByStoreService = async (storeId: string) => {
  return await sql`
    SELECT * FROM products WHERE "storeId" = ${storeId}
  `
}