import { signIn } from './user-api'

export async function getToken(login, password) {
  const {
    data: {
      data: {
        signIn: { token },
      },
    },
  } = await signIn({ login, password })

  return token
}

export const getAdminToken = getToken.bind(null, 'mario', 'mario123')
export const getUserToken = getToken.bind(null, 'luigi', 'luigi123')
