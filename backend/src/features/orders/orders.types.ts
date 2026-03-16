export interface Order {
  id: string
  consumerId: string
  storeId: string
  deliveryId?: string
  status: string
  createdAt: Date
}

export interface OrderItem {
  productId: string
  quantity: number
}