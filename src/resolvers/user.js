import jwt from 'jsonwebtoken'
import { AuthenticationError, ForbiddenError, UserInputError } from 'apollo-server'

function createToken({ id, email, username }, secret, expiresIn) {
  return jwt.sign({ id, email, username }, secret, { expiresIn })
}

export default {
  Query: {
    users: (parent, args, { models }) => models.User.findAll(),
    user: (parent, { id }, { models }) => models.User.findById(id),
    me: (parent, args, { me, models }) => {
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
  },

  User: {
    messages: (user, args, { models }) => models.Message.findAll({
      where: {
        userId: user.id,
      },
    }),
  },
}
