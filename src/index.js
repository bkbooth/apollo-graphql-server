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
    firstName: String
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

const resolvers = {
  Query: {
    users: () => Object.values(users),
    user: (parent, args) => users[args.id],
    me: (parent, args, context) => context.me,
  },

  User: {
    firstName: parent => parent.username.split(' ')[0],
  },
}

const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
  context: {
    me: users[1],
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
