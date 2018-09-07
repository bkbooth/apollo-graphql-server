import {
  gql,
} from 'apollo-server-express'

export default gql `
  type Query {
    users: [User!]
    user(id: ID!): User
    me: User

    messages: [Message!]!
    message(id: ID!): Message!
  }

  type Mutation {
    createMessage(text: String!): Message!
    updateMessage(id: ID!, text: String!): Message!
    deleteMessage(id: ID!): Boolean!
  }

  type User {
    id: ID!
    username: String!
    firstName: String
    age: Int
    messages: [Message!]
  }

  type Message {
    id: ID!
    text: String!
    user: User!
  }
`
