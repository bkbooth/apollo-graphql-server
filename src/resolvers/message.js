import Sequelize from 'sequelize'
import { combineResolvers } from 'graphql-resolvers'

import { isAuthenticated, isMessageOwner } from './authorization'

const toCursorHash = cursor => Buffer.from(cursor).toString('base64')
const fromCursorHash = hash => Buffer.from(hash, 'base64').toString('ascii')

export default {
  Query: {
    messages: async (parent, { cursor, limit = 100 }, { models }) => {
      const cursorOptions = cursor
        ? {
          where: {
            createdAt: {
              [Sequelize.Op.lt]: fromCursorHash(cursor),
            },
          },
        }
        : {}

      const messages = await models.Message.findAll({
        limit: limit + 1,
        order: [['createdAt', 'DESC']],
        ...cursorOptions,
      })

      const hasNextPage = messages.length > limit
      const edges = hasNextPage ? messages.slice(0, -1) : messages

      return {
        edges,
        pageInfo: {
          hasNextPage,
          endCursor: toCursorHash(edges[edges.length - 1].createdAt.toString()),
        },
      }
    },
    message: (parent, { id }, { models }) => models.Message.findById(id),
  },

  Mutation: {
    createMessage: combineResolvers(
      isAuthenticated,
      (parent, { text }, { models, me }) => models.Message.create({
        text,
        userId: me.id,
      }),
    ),

    updateMessage: combineResolvers(
      isMessageOwner,
      (parent, { id, text }, { models }) => models.Message.update({
        text,
      },{
        where: { id },
        returning: true,
      }).then(([_, [message]]) => message),
    ),

    deleteMessage: combineResolvers(
      isMessageOwner,
      (parent, { id }, { models }) => models.Message.destroy({
        where: { id },
      }),
    ),
  },

  Message: {
    user: (message, args, { models }) => models.User.findById(message.userId),
  },
}
