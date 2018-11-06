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

    // updateMessage: (parent, { id, text }, { models }) => {
    //   const {
    //     [id]: message,
    //     ...otherMessages
    //   } = models.messages
    //   if (!message) throw new Error(`Message '${id}' doesn't exist`)

    //   message.text = text
    //   models.messages = {
    //     message,
    //     ...otherMessages,
    //   }

    //   return message
    // },

    deleteMessage: (parent, { id }, { models }) => models.Message.destroy({
      where: { id },
    }),
  },

  Message: {
    user: (message, args, { models }) => models.User.findById(message.userId),
  },
}
