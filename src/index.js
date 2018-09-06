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
    users: [User!]
    user(id: ID!): User
    me: User
  }

  type User {
    id: ID!
    username: String!
  }
`

const users = {
  1: {
    id: '1',
    username: 'Roger Bolson',
  },
  2: {
    id: '2',
    username: 'Barry Johnson',
  },
}

const me = users[1];

const resolvers = {
  Query: {
    users: () => {
      return Object.values(users)
    },
    user: (parent, args) => {
      return users[args.id];
    },
    me: () => me,
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
