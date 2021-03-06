import 'dotenv/config'
import { expect } from 'chai'
import jwt from 'jsonwebtoken'

import { createUser, getAdminToken, getUserToken } from './utils'
import * as userApi from './user-api'

describe('users', () => {
  describe('user(id: String!): User', () => {
    it('returns a user when user can be found', async () => {
      const expectedUser = {
        id: '1',
        username: 'mario',
        email: 'mario@example.com',
        role: 'ADMIN',
      }

      const {
        data: { user },
      } = await userApi.getUser({ id: '1' })
      expect(user).to.eql(expectedUser)
    })

    it('returns null when user cannot be found', async () => {
      const {
        data: { user },
      } = await userApi.getUser({ id: '42' })
      expect(user).to.be.null
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

      expect(errors[0].message).to.eql('Validation error')
    })

    it('returns an error for invalid password', async () => {
      const { errors } = await userApi.signUp({
        username: 'tester',
        email: 'tester@example.com',
        password: 'test',
      })

      expect(errors[0].message).to.eql('Validation len on password failed')
    })
  })

  describe('signIn(login: String!, password: String!): Token!', () => {
    it('returns a token for signin with valid credentials', async () => {
      const {
        data: {
          signIn: { token },
        },
      } = await userApi.signIn({ login: 'mario', password: 'mario123' })
      expect(token).to.exist

      const { id, email } = jwt.verify(token, process.env.SECRET)
      expect(id).to.eql(1)
      expect(email).to.eql('mario@example.com')
    })

    it('returns an error for unknown login', async () => {
      const { errors } = await userApi.signIn({ login: 'uknown', password: 'mario123' })

      expect(errors[0].message).to.eql('Invalid login or password.')
    })

    it('returns an error for invalid password', async () => {
      const { errors } = await userApi.signIn({ login: 'mario', password: 'invalid' })

      expect(errors[0].message).to.eql('Invalid login or password.')
    })
  })

  describe('deleteUser(id: String!): Boolean!', () => {
    it('deletes the user if current user is admin', async () => {
      const adminToken = await getAdminToken()
      const { id } = await createUser('dummy', 'dummy@example.com', 'dummy123')

      const {
        data: { deleteUser: isDeleted }
      } = await userApi.deleteUser({ id }, adminToken)

      expect(isDeleted).to.be.true
    })

    it('returns a permisson error if current user is not admin', async () => {
      const token = await getUserToken()

      const { errors } = await userApi.deleteUser({ id: '1' }, token)

      expect(errors[0].message).to.eql('You do not have permission.')
    })
  })
})
