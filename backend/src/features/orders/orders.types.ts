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

export enum OrderStatus {
  CREATED = 'Creado',
  IN_DELIVERY = 'En entrega',
  DELIVERED = 'Entregado'
}