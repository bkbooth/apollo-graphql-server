import 'dotenv/config'
import { expect } from 'chai'
import jwt from 'jsonwebtoken'

import { getUserToken } from './utils'
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
      expect(result).to.eql(expectedResult)
    })

    it('returns null when user cannot be found', async () => {
      const expectedResult = {
        data: {
          user: null,
        },
      }

      const result = await userApi.getUser({ id: '42' })
      expect(result).to.eql(expectedResult)
    })
  })

  describe('signUp(username: String!, email: String!, password: String!): Token!', () => {
    it('creates a user and returns a token', async () => {
      const credentials = {
        username: 'tester',
        email: 'tester@example.com',
        password: 'tester123',
      }

      const {
        data: {
          signUp: { token },
        },
      } = await userApi.signUp(credentials)
      expect(token).to.exist

      const { id } = jwt.verify(token, process.env.SECRET)
      const {
        data: {
          user: { username, email, role },
        },
      } = await userApi.getUser({ id })
      expect(username).to.eql(credentials.username)
      expect(email).to.eql(credentials.email)
      expect(role).to.eql('USER')
    })

    it('returns a validation error for duplicate email or username', async () => {
      const { errors } = await userApi.signUp({
        username: 'mario',
        email: 'mario@example.com',
        password: 'mario123',
      })

      expect(errors[0].message).to.equal('Validation error')
    })

    it('returns an error for invalid password', async () => {
      const { errors } = await userApi.signUp({
        username: 'tester',
        email: 'tester@example.com',
        password: 'test',
      })

      expect(errors[0].message).to.equal('Validation len on password failed')
    })
  })

  describe('deleteUser(id: String!): Boolean!', () => {
    it('returns an error because only admins can delete a user', async () => {
      const token = await getUserToken()

      const { errors } = await userApi.deleteUser({ id: '1' }, token)

      expect(errors[0].message).to.eql('You do not have permission.')
    })
  })
})
