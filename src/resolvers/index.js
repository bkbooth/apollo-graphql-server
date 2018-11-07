import { GraphQLDateTime } from 'graphql-iso-date'

import userResolvers from './user'
import messageResolvers from './message'

const customScalarResolver = {
  DateTime: GraphQLDateTime,
}

export default [
  customScalarResolver,
  userResolvers,
  messageResolvers,
]
