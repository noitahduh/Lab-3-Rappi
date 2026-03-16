export interface Delivery {
  id: string
  orderId: string
  deliveryId: string
  status: string
}

export interface CreateDeliveryInput {
  orderId: string
  deliveryId: string
}