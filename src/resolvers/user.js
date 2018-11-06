import jwt from 'jsonwebtoken'
import { combineResolvers } from 'graphql-resolvers'
import { AuthenticationError, UserInputError } from 'apollo-server'

import { isAdmin } from './authorization'

function createToken({ id, email, username, role }, secret, expiresIn) {
  return jwt.sign({ id, email, username, role }, secret, { expiresIn })
}

export default {
  Query: {
    users: (parent, args, { models }) => models.User.findAll(),
    user: (parent, { id }, { models }) => models.User.findById(id),
    me: (parent, args, { models, me }) => {
      if (!me) return null

      return models.User.findById(me.id)
    },
  },

  Mutation: {
    signUp: async (parent, { username, email, password }, { models, secret }) => {
      const user = await models.User.create({
        username,
        email,
        password,
      })

      return {
        token: createToken(user, secret, '30m'),
      }
    },

    signIn: async (parent, { login, password }, { models, secret }) => {
      const user = await models.User.findByLogin(login)
      if (!user) throw new UserInputError('Invalid login or password.')

      const isValid = await user.validatePassword(password)
      if(!isValid) throw new AuthenticationError('Invalid login or password.')

      return {
        token: createToken(user, secret, '30m'),
      }
    },

    deleteUser: combineResolvers(
      isAdmin,
      (parent, { id }, { models }) => models.User.destroy({
        where: { id },
      }),
    ),
  },

  User: {
    messages: (user, args, { models }) => models.Message.findAll({
      where: {
        userId: user.id,
      },
    }),
  },
}
