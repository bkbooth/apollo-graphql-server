import { expect } from 'chai'

describe('users', () => {
  it('user is user', async () => {
    const done = await delay(true)
    expect(done).to.be.true
  })
})

function delay(result, ms = 1000) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(result), ms)
  })
}
