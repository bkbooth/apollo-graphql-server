import 'dotenv/config'
import http from 'http'
import express from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import { ApolloServer, AuthenticationError } from 'apollo-server-express'
import DataLoader from 'dataloader'

import schema from './schema'
import resolvers from './resolvers'
import models, { sequelize } from './models'
import loaders from './loaders'

const SECRET = process.env.SECRET
const HOST = process.env.HOST || 'localhost'
const PORT = process.env.PORT || 8000
const GRAPHQL_PATH = 'graphql'
const IS_TEST = !!process.env.TEST_DATABASE

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
  context: async ({ req, connection }) => {
    if (connection) {
      return {
        models,
        loaders: {
          user: new DataLoader(keys => loaders.user.batchUsers(keys, models)),
        },
      }
    }

    if (req) {
      return {
        models,
        me: await getMe(req),
        secret: SECRET,
        loaders: {
          user: new DataLoader(keys => loaders.user.batchUsers(keys, models)),
        },
      }
    }
  },
})

server.applyMiddleware({
  app,
  path: `/${GRAPHQL_PATH}`,
})

const httpServer = http.createServer(app)
server.installSubscriptionHandlers(httpServer)

sequelize.sync({ force: IS_TEST }).then(() => {
  if (IS_TEST) {
    createUsersWithMessages(new Date())
  }

  httpServer.listen({ host: HOST, port: PORT }, () => {
    console.log(`Apollo Server on http://${HOST}:${PORT}/${GRAPHQL_PATH}`)
  })
})

async function createUsersWithMessages(date) {
  await models.User.create({
    username: 'mario',
    email: 'mario@example.com',
    password: 'mario123',
    role: 'ADMIN',
    messages: [
      {
        text: 'Learning about GraphQL and Apollo!',
        createdAt: date.setSeconds(date.getSeconds() + 1),
      },
      {
        text: 'This is another message...',
        createdAt: date.setSeconds(date.getSeconds() + 1),
      },
    ],
  }, {
    include: [models.Message],
  })

  await models.User.create({
    username: 'luigi',
    email: 'luigi@example.com',
    password: 'luigi123',
    role: 'USER',
    messages: [
      {
        text: 'I\'m the green guy',
        createdAt: date.setSeconds(date.getSeconds() + 1),
      },
      {
        text: 'I wish more people liked me',
        createdAt: date.setSeconds(date.getSeconds() + 1),
      },
    ],
  }, {
    include: [models.Message],
  })
}
