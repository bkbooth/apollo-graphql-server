import axios from 'axios'

const API_URL = 'http://localhost:8000/graphql'

export const getMessage = variables =>
  axios.post(API_URL, {
    query: `
      query ($id: ID!) {
        message(id: $id) {
          id
          text
          user {
            id
            username
          }
        }
      }
    `,
    variables,
  }).then(result => result.data)

export const createMessage = (variables, token) =>
  axios.post(API_URL, {
    query: `
      mutation ($text: String!) {
        createMessage(text: $text) {
          id
          text
          user {
            id
            username
          }
        }
      }
    `,
    variables,
  }, {
    headers: {
      'x-token': token,
    },
  }).then(result => result.data)
