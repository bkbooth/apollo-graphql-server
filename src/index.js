import express from 'express'
import cors from 'cors'
import {
  ApolloServer,
  gql,
} from 'apollo-server-express'

const HOST = process.env.HOST || 'localhost'
const PORT = process.env.PORT || 8000
const GRAPHQL_PATH = 'graphql'

const app = express()
app.use(cors())

const schema = gql `
  type Query {
    me: User
  }

  type User {
    username: String!
  }
`

const resolvers = {
  Query: {
    me: () => {
      return {
        username: 'Foo Barson',
      }
    },
  },
}

const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
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
