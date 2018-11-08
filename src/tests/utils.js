import jwt from 'jsonwebtoken'

import { signIn, signUp } from './user-api'

export async function createUser(username, email, password) {
  const {
    data: {
      signUp: { token }
    }
  } = await signUp({ username, email, password })

  const { id, role } = jwt.verify(token, process.env.SECRET)

  return { token, id, username, email, role }
}

export async function getToken(login, password) {
  const {
    data: {
      signIn: { token },
    },
  } = await signIn({ login, password })

  return token
}

export const getAdminToken = getToken.bind(null, 'mario', 'mario123')
export const getUserToken = getToken.bind(null, 'luigi', 'luigi123')
