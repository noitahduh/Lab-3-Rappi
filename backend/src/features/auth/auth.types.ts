export interface CreateUserInput {
  name: string
  email: string
  password: string
  role: UserRole
  storeName?: string
}

export interface AuthenticateUserInput {
  email: string
  password: string
}

export enum UserRole {
  consumer = 'consumer',
  store = 'store',
  delivery = 'delivery'
}