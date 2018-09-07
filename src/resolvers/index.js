import uuidv4 from 'uuid/v4'

export default {
  Query: {
    users: (parent, args, {
      models,
    }) => Object.values(models.users),
    user: (parent, {
      id,
    }, {
      models,
    }) => models.users[id],
    me: (parent, args, {
      me,
    }) => me,
    messages: (parent, args, {
      models,
    }) => Object.values(models.messages),
    message: (parent, {
      id,
    }, {
      models,
    }) => models.messages[id],
  },

  Mutation: {
    createMessage: (parent, {
      text,
    }, {
      me,
      models,
    }) => {
      const id = uuidv4()
      const message = {
        id,
        text,
        userId: me.id,
      }

      models.messages[id] = message
      models.users[me.id].messageIds.push(id)

      return message
    },

    updateMessage: (parent, {
      id,
      text,
    }, {
      models,
    }) => {
      const {
        [id]: message,
        ...otherMessages
      } = models.messages
      if (!message) throw new Error(`Message '${id}' doesn't exist`)

      message.text = text
      models.messages = {
        message,
        ...otherMessages
      }

      return message
    },

    deleteMessage: (parent, {
      id,
    }, {
      models,
    }) => {
      const {
        [id]: message,
        ...otherMessages
      } = models.messages
      if (!message) throw new Error(`Message '${id}' doesn't exist`)

      models.messages = otherMessages
      return true
    },
  },

  User: {
    firstName: user => user.username.split(' ')[0],
    messages: (user, args, {
      models,
    }) => Object.values(models.messages).filter(message => message.userId === user.id),
  },

  Message: {
    user: (message, args, {
      models,
    }) => models.users[message.userId],
  },
}
