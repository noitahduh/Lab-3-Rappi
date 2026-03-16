import sql from '../../db'
import { CreateUserInput, AuthenticateUserInput } from './auth.types'
import { v4 as uuidv4 } from 'uuid'

export const createUserService = async ({
  name,
  email,
  password,
  role,
  storeName
}: CreateUserInput) => {

  const [existing] = await sql`
    SELECT id FROM users WHERE email = ${email}
  `
  if (existing) throw new Error('User already exists')

  const id = uuidv4()

  const [user] = await sql`
    INSERT INTO users (id, name, email, password, role)
    VALUES (${id}, ${name}, ${email}, ${password}, ${role})
    RETURNING id, name, email, role
  `

  if (role === 'store' && storeName) {
    const storeId = uuidv4()
    await sql`
      INSERT INTO stores (id, name, "isOpen", "userId")
      VALUES (${storeId}, ${storeName}, false, ${id})
    `
  }

  return user
}

export const authenticateUserService = async ({
  email,
  password
}: AuthenticateUserInput) => {

  const [user] = await sql`
    SELECT id, name, email, role, password FROM users WHERE email = ${email}
  `

  if (!user) throw new Error('User not found')
  if (user.password !== password) throw new Error('Invalid password')

  const { password: _, ...userWithoutPassword } = user
  return userWithoutPassword
}