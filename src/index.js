import express from 'express'
import cors from 'cors'
import { ApolloServer } from 'apollo-server-express'

import schema from './schema'
import resolvers from './resolvers'
import models from './models'

const HOST = process.env.HOST || 'localhost'
const PORT = process.env.PORT || 8000
const GRAPHQL_PATH = 'graphql'

const app = express()
app.use(cors())

const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
  context: {
    models,
    me: models.users[1],
  },
})

server.applyMiddleware({
  app,
  path: `/${GRAPHQL_PATH}`,
})

app.listen({
  host: HOST,
  port: PORT,
}, () => {
  console.log(`Apollo Server on http://${HOST}:${PORT}/${GRAPHQL_PATH}`)
})
