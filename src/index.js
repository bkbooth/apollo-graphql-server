import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { ApolloServer } from 'apollo-server-express'

import schema from './schema'
import resolvers from './resolvers'
import models, { sequelize } from './models'

const HOST = process.env.HOST || 'localhost'
const PORT = process.env.PORT || 8000
const GRAPHQL_PATH = 'graphql'
const ERASE_DATABASE_ON_SYNC = true

const app = express()
app.use(cors())

const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
  formatError: error => {
    // remove the internal sequelize error message
    // leave only the important validation error
    const message = error.message
      .replace('SequelizeValidationError: ', '')
      .replace('Validation error: ', '')

    return {
      ...error,
      message,
    }
  },
  context: async () => ({
    models,
    me: await models.User.findByLogin('mario'),
  }),
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
    messages: [
      { text: 'Learning about GraphQL and Apollo!' },
      { text: 'This is another message...' },
    ],
  }, {
    include: [models.Message],
  })

  await models.User.create({
    username: 'luigi',
    messages: [
      { text: 'I\'m the green guy' },
      { text: 'I wish more people liked me' },
    ],
  }, {
    include: [models.Message],
  })
}
