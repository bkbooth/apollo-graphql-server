import uuidv4 from 'uuid/v4'

export default {
  Query: {
    messages: (parent, args, { models }) => models.Message.findAll(),
    message: (parent, { id }, { models }) => models.Message.findById(id),
  },

  Mutation: {
    createMessage: (parent, { text }, { me, models }) => models.Message.create({
      text,
      userId: me.id,
    }),

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
