import axios from 'axios'

const API_URL = 'http://localhost:8000/graphql'

export const user = variables =>
  axios.post(API_URL, {
    query: `
      query ($id: ID!) {
        user(id: $id) {
          id
          username
          email
          role
        }
      }
    `,
    variables,
  })

export const signIn = variables =>
  axios.post(API_URL, {
    query: `
      mutation ($login: String!, $password: String!) {
        signIn(login: $login, password: $password) {
          token
        }
      }
    `,
    variables,
  })

export const deleteUser = (variables, token) =>
  axios.post(API_URL, {
    query: `
      mutation ($id: ID!) {
        deleteUser(id: $id)
      }
    `,
    variables,
  }, {
    headers: {
      'x-token': token,
    },
  })
