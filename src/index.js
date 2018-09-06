import express from 'express'
import cors from 'cors'
import {
  ApolloServer,
  gql,
} from 'apollo-server-express'
import uuidv4 from 'uuid/v4'

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

    messages: [Message!]!
    message(id: ID!): Message!
  }

  type Mutation {
    createMessage(text: String!): Message!
  }

  type User {
    id: ID!
    username: String!
    firstName: String
    messages: [Message!]
  }

  type Message {
    id: ID!
    text: String!
    user: User!
  }
`

const users = {
  1: {
    id: '1',
    username: 'Roger Bolson',
    messageIds: ['1'],
  },
  2: {
    id: '2',
    username: 'Barry Johnson',
    messageIds: ['2'],
  },
}

const messages = {
  1: {
    id: '1',
    text: 'Hello world!',
    userId: '1',
  },
  2: {
    id: '2',
    text: 'Goodbye world!',
    userId: '2',
  },
}

const resolvers = {
  Query: {
    users: () => Object.values(users),
    user: (parent, args) => users[args.id],
    me: (parent, args, context) => context.me,
    messages: () => Object.values(messages),
    message: (parent, args) => messages[args.id],
  },

  Mutation: {
    createMessage: (parent, args, context) => {
      const message = {
        id: uuidv4(),
        text: args.text,
        userId: context.me.id,
      }

      messages[message.id] = message;
      users[context.me.id].messageIds.push(message.id);

      return message
    },
  },

  User: {
    firstName: user => user.username.split(' ')[0],
    messages: user => Object.values(messages).filter(message => message.userId === user.id),
  },

  Message: {
    user: message => users[message.userId],
  }
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
