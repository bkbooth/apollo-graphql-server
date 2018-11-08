import { expect } from 'chai'

import { getAdminToken, getUserToken } from './utils'
import * as userApi from './user-api'

describe('users', () => {
  describe('user(id: String!): User', () => {
    it('returns a user when user can be found', async () => {
      const expectedResult = {
        data: {
          user: {
            id: '1',
            username: 'mario',
            email: 'mario@example.com',
            role: 'ADMIN',
          },
        },
      }

      const result = await userApi.getUser({ id: '1' })
      expect(result.data).to.eql(expectedResult)
    })

    it('returns null when user cannot be found', async () => {
      const expectedResult = {
        data: {
          user: null,
        },
      }

      const result = await userApi.getUser({ id: '42' })
      expect(result.data).to.eql(expectedResult)
    })
  })

  describe('deleteUser(id: String!): Boolean!', () => {
    it('returns an error because only admins can delete a user', async () => {
      const token = await getUserToken()

      const {
        data: { errors },
      } = await userApi.deleteUser({ id: '1' }, token)

      expect(errors[0].message).to.eql('You do not have permission.')
    })
  })
})
