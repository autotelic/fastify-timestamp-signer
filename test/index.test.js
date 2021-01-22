const { test } = require('tap')
const Fastify = require('fastify')

const signer = require('..')
const { useFakeTimers } = require('sinon')

const testString = 'test@example.com'
const secret = 'secret'
const testSalt = 'test-salt'
const testTimestamp = 1611274828425

test('sign and validate decorators exist.', t => {
  t.plan(3)
  const fastify = Fastify()

  fastify.register(signer, { secret })

  fastify.ready(err => {
    t.error(err)

    t.ok(fastify.hasDecorator('sign'))
    t.ok(fastify.hasDecorator('validate'))
  })
})

test('fastify-timestamp-signer throws error if not initialized with secret.', t => {
  t.plan(2)
  const fastify = Fastify()

  fastify.register(signer)

  fastify.ready(err => {
    t.ok(err instanceof Error)
    t.is(err.message, 'secret in options object is missing or not a string')
  })
})

test('sign method:', t => {
  t.test('returns a signed string', async t => {
    const expectedSignedString = 'test@example.com:1611274828425:6OjI9CLdNfafzrYOxjNWWCDi1mC3rg25BsFr7CTPXKlJfGbYUWQgpEGmhqsf6tKNCTYrCpKzFTUhSGNZMBiVKQ=='
    const fastify = Fastify()

    fastify.register(signer, { secret })

    await fastify.ready()
    const signedString = await fastify.sign(testString, { timestamp: testTimestamp, salt: testSalt })
    t.is(signedString, expectedSignedString)
  })
  test('assigns default values in absence of options', async t => {
    const expectedSignedString = 'test@example.com:1611274828425:WVe+5Gh56fsugvkOEFKvZ4mDlq/YYVI6aRH9TPTqmnJx5yrk1UyXp6fi39m9X7prctIv8PIv5QzS8W8FIVdq9g=='
    const fastify = Fastify()

    fastify.register(signer, { secret })

    await fastify.ready()
    const clock = useFakeTimers((new Date(testTimestamp)).getTime())
    const signedString = await fastify.sign(testString)
    clock.restore()
    t.is(signedString, expectedSignedString)
  })
  t.end()
})

test('validate method returns a string', t => {
  t.plan(2)
  const fastify = Fastify()

  fastify.register(signer, { secret })

  fastify.ready(err => {
    t.error(err)
    t.type(typeof fastify.validate('test string'), 'string')
  })
})
