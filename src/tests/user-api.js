import axios from 'axios'

const API_URL = 'http://localhost:8000/graphql'

export const getUser = variables =>
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
  }).then(result => result.data)

export const signUp = variables =>
  axios.post(API_URL, {
    query: `
      mutation ($username: String!, $email: String!, $password: String!) {
        signUp(username: $username, email: $email, password: $password) {
          token
        }
      }
    `,
    variables,
  }).then(result => result.data)

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
  }).then(result => result.data)

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
  }).then(result => result.data)
