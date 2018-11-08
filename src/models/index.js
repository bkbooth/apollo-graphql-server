import Sequelize from 'sequelize'

const DATABASE = process.env.TEST_DATABASE || process.env.DATABASE || 'postgres'
const DATABASE_USER = process.env.DATABASE_USER || 'postgres'
const DATABASE_PASSWORD = process.env.DATABASE_PASSWORD || 'postgres'

const sequelize = new Sequelize(
  DATABASE,
  DATABASE_USER,
  DATABASE_PASSWORD,
  { dialect: 'postgres' },
)

const models = {
  User: sequelize.import('./user'),
  Message: sequelize.import('./message'),
}

Object.keys(models).forEach(key => {
  if ('associate' in models[key]) {
    models[key].associate(models)
  }
})

export { sequelize }
export default models
