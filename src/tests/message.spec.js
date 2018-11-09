import 'dotenv/config'
import { expect } from 'chai'

import * as messageApi from './message-api'

describe('messages', () => {
  describe('message(id: String!): Message', () => {
    it('returns a message when message can be found', async () => {
      const expectedResult = {
        data: {
          message: {
            id: '1',
            text: 'Learning about GraphQL and Apollo!',
            user: {
              id: '1',
              username: 'mario',
            },
          },
        },
      }

      const result = await messageApi.getMessage({ id: '1' })
      expect(result).to.eql(expectedResult)
    })

    it('returns null when message cannot be found', async () => {
      const expectedResult = {
        data: {
          message: null,
        },
      }

      const result = await messageApi.getMessage({ id: '42' })
      expect(result).to.eql(expectedResult)
    })
  })
})
