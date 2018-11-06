import bcrypt from 'bcrypt'

const SALT_ROUNDS = 10

const user = (sequelize, DataTypes) => {
  const User = sequelize.define('user', {
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        notEmpty: true,
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [7, 42],
      },
    },
    role: {
      type: DataTypes.STRING,
    },
  })

  User.associate = models => {
    User.hasMany(models.Message, { onDelete: 'CASCADE' })
  }

  User.findByLogin = async login => {
    let user = await User.findOne({
      where: { username: login },
    })

    if (!user) {
      user = await User.findOne({
        where: { email: login },
      })
    }

    return user
  }

  User.beforeCreate(async user => {
    user.password = await user.generatePasswordHash()
  })

  User.prototype.generatePasswordHash = function() {
    return bcrypt.hash(this.password, SALT_ROUNDS)
  }

  User.prototype.validatePassword = function(inputPassword) {
    return bcrypt.compare(inputPassword, this.password)
  }

  return User
}

export default user
