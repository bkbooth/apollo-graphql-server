import jwt from 'jsonwebtoken'

import * as userApi from './user-api'
import * as messageApi from './message-api'

export async function createUser(username, email, password) {
  const {
    data: {
      signUp: { token }
    }
  } = await userApi.signUp({ username, email, password })

  const { id, role } = jwt.verify(token, process.env.SECRET)

  return { token, id, username, email, role }
}

export async function createMessage(text, token) {
  const {
    data: { createMessage: message },
  } = await messageApi.createMessage({ text }, token)

  return message
}

export async function getToken(login, password) {
  const {
    data: {
      signIn: { token },
    },
  } = await userApi.signIn({ login, password })

  return token
}

export const getAdminToken = getToken.bind(null, 'mario', 'mario123')
export const getUserToken = getToken.bind(null, 'luigi', 'luigi123')
