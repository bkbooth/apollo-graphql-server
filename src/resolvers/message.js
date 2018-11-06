import { combineResolvers } from 'graphql-resolvers'

import { isAuthenticated } from './authorization'

export default {
  Query: {
    messages: (parent, args, { models }) => models.Message.findAll(),
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

    updateMessage: (parent, { id, text }, { models }) => models.Message.update({
      text,
    },{
      where: { id },
      returning: true,
    }).then(([_, [message]]) => message),

    deleteMessage: (parent, { id }, { models }) => models.Message.destroy({
      where: { id },
    }),
  },

  Message: {
    user: (message, args, { models }) => models.User.findById(message.userId),
  },
}
