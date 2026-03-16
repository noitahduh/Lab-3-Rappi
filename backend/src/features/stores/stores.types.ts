export interface Store {
  id: string
  name: string
  isOpen: boolean
  userId: string
}

export interface CreateStoreInput {
  name: string
  userId: string
}

export interface CreateProductInput {
  name: string
  price: number
  storeId: string
}