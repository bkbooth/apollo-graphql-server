import { expect } from 'chai'

import { createMessage, getAdminToken, getUserToken } from './utils'
import * as messageApi from './message-api'

describe('messages', () => {
  describe('message(id: String!): Message', () => {
    it('returns a message when message can be found', async () => {
      const expectedMessage = {
        id: '1',
        text: 'Learning about GraphQL and Apollo!',
        user: {
          id: '1',
          username: 'mario',
        },
      }

      const {
        data: { message },
      } = await messageApi.getMessage({ id: '1' })
      expect(message).to.eql(expectedMessage)
    })

    it('returns null when message cannot be found', async () => {
      const {
        data: { message },
      } = await messageApi.getMessage({ id: '42' })
      expect(message).to.be.null
    })
  })

  describe('createMessage(text: String!): Message!', () => {
    it('creates and returns the message', async () => {
      const token = await getUserToken()
      const text = 'This is a test!'

      const {
        data: { createMessage: message },
      } = await messageApi.createMessage({ text }, token)

      expect(message.id).to.be.a('string')
      expect(message.text).to.eql(text)
      expect(message.user.username).to.eql('luigi')
    })

    it('returns a validation error for empty message text', async () => {
      const token = await getUserToken()

      const { errors } = await messageApi.createMessage({ text: '' }, token)

      expect(errors[0].message).to.eql('You must provide text for the message.')
    })

    it('returns an error when not authenticated', async () => {
      const token = 'an.invalid.token'
      try {
        await messageApi.createMessage({ tesxt: 'This is a test!' }, token)
      } catch (err) {
        expect(err.response.status).to.eql(400)
      }
    })
  })

  describe('updateMessage(id: ID!, text: String!): Message!', () => {
    let ownerToken, messageId

    beforeEach(async () => {
      ownerToken = await getUserToken()
      const { id } = await createMessage('This is a test!', ownerToken)
      messageId = id
    })

    afterEach(() => messageApi.deleteMessage({ id: messageId }, ownerToken))

    it('updates the message if current user is the message owner', async () => {
      const updatedText = 'This is updated!'

      const {
        data: { updateMessage: message }
      } = await messageApi.updateMessage({ id: messageId, text: updatedText }, ownerToken)

      expect(message.id).to.eql(messageId)
      expect(message.text).to.eql(updatedText)
    })


    it('returns a permisson error if current user is not the message owner', async () => {
      const otherToken = await getAdminToken()
      const { errors } = await messageApi.updateMessage({ id: messageId, text: 'Updated!' }, otherToken)

      expect(errors[0].message).to.eql('You are not the owner of this message.')
    })
  })

  describe('deleteMessage(id: ID!): Boolean!', () => {
    let ownerToken, messageId

    beforeEach(async () => {
      ownerToken = await getUserToken()
      const { id } = await createMessage('This is a test!', ownerToken)
      messageId = id
    })

    it('deletes the message if current user is the message owner', async () => {
      const {
        data: { deleteMessage: isDeleted }
      } = await messageApi.deleteMessage({ id: messageId }, ownerToken)

      expect(isDeleted).to.be.true
    })

    after(() => messageApi.deleteMessage({ id: messageId }, ownerToken))

    it('returns a permisson error if current user is not the message owner', async () => {
      const otherToken = await getAdminToken()
      const { errors } = await messageApi.deleteMessage({ id: messageId }, otherToken)

      expect(errors[0].message).to.eql('You are not the owner of this message.')
    })
  })
})
