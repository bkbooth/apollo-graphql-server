export default {
  Query: {
    users: (parent, args, { models }) => models.User.findAll(),
    user: (parent, { id }, { models }) => models.User.findById(id),
    me: (parent, args, { me }) => models.User.findById(me.id),
  },

  User: {
    messages: (user, args, { models }) => models.Message.findAll({
      where: {
        userId: user.id,
      },
    }),
  },
}
