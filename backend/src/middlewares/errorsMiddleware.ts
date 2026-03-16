import { Request, Response, NextFunction } from 'express'
import Boom from '@hapi/boom'

export const errorsMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {

  if (Boom.isBoom(err)) {
    return res.status(err.output.statusCode).json(err.output.payload)
  }

  console.error(err)

  res.status(500).json({
    message: 'Internal Server Error'
  })
}