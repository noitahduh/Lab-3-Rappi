import { Router } from 'express'
import { authenticateUserController, createUserController } from './auth.controller'

export const router = Router()

router.post('/register', createUserController)
router.post('/login', authenticateUserController)