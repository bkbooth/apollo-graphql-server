import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import { ApolloServer, AuthenticationError } from 'apollo-server-express'

import schema from './schema'
import resolvers from './resolvers'
import models, { sequelize } from './models'

const SECRET = process.env.SECRET
const HOST = process.env.HOST || 'localhost'
const PORT = process.env.PORT || 8000
const GRAPHQL_PATH = 'graphql'
const ERASE_DATABASE_ON_SYNC = true

const getMe = req => {
  const token = req.headers['x-token']
  if (token) {
    try {
      return jwt.verify(token, SECRET)
    } catch (err) {
      throw new AuthenticationError('Your session has expired. Please signin again.')
    }
  }
}

const app = express()
app.use(cors())

const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
  formatError: error => {
    // remove the internal sequelize error message
    // leave only the important validation error
    const message = error.message
      .replace('Context creation failed: ', '')
      .replace('SequelizeValidationError: ', '')
      .replace('Validation error: ', '')

    return {
      ...error,
      message,
    }
  },
  context: async ({ req }) => {
    const me = await getMe(req)

    return {
      models,
      me,
      secret: SECRET,
    }
  },
})

server.applyMiddleware({
  app,
  path: `/${GRAPHQL_PATH}`,
})

sequelize.sync({ force: ERASE_DATABASE_ON_SYNC }).then(() => {
  if (ERASE_DATABASE_ON_SYNC) {
    createUsersWithMessages()
  }

  app.listen({ host: HOST, port: PORT }, () => {
    console.log(`Apollo Server on http://${HOST}:${PORT}/${GRAPHQL_PATH}`)
  })
})

async function createUsersWithMessages() {
  await models.User.create({
    username: 'mario',
    email: 'mario@example.com',
    password: 'mario123',
    messages: [
      { text: 'Learning about GraphQL and Apollo!' },
      { text: 'This is another message...' },
    ],
  }, {
    include: [models.Message],
  })

  await models.User.create({
    username: 'luigi',
    email: 'luigi@example.com',
    password: 'luigi123',
    messages: [
      { text: 'I\'m the green guy' },
      { text: 'I wish more people liked me' },
    ],
  }, {
    include: [models.Message],
  })
}
