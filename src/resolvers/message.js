import Sequelize from 'sequelize'
import { combineResolvers } from 'graphql-resolvers'

import { isAuthenticated, isMessageOwner } from './authorization'

export default {
  Query: {
    messages: (parent, { cursor, limit = 100 }, { models }) => models.Message.findAll({
      limit,
      order: [['createdAt', 'DESC']],
      where: cursor
        ? {
          createdAt: {
            [Sequelize.Op.lt]: cursor,
          },
        }
        : null,
    }),
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
