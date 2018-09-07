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
  },

  User: {
    firstName: user => user.username.split(' ')[0],
    messages: (user, args, {
      models,
    }) => Object.values(models.messages).filter(message => message.userId === user.id),
  },
}
