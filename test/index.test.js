const { test } = require('tap')
const Fastify = require('fastify')

const signer = require('..')
const { generateRandomSalt, generateTimestamp } = require('../lib/helpers')
const { isValidTimestamp } = require('./helpers')

const testString = 'test@example.com'
const secret = 'secret'
const delimiter = ':'
const testSalt = generateRandomSalt()
const testTimestamp = generateTimestamp()

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
  t.test('returns a signed string', t => {
    t.plan(5)
    const fastify = Fastify()

    fastify.register(signer, { secret })

    fastify.ready(async err => {
      t.error(err)
      const signedString = await fastify.sign(testString, { timestamp: testTimestamp, salt: testSalt })

      t.type(signedString, 'string')

      const [value, timestamp, signature] = signedString.split(delimiter)
      t.is(value, testString)
      t.same(new Date(Number(timestamp)), new Date(testTimestamp))
      t.is(signature, (await fastify.sign(testString, { timestamp: testTimestamp, salt: testSalt })).split(delimiter)[2], 'sign returns a reproducable signature')
    })
  })
  test('assigns default values in absence of options', t => {
    t.plan(5)
    const fastify = Fastify()

    fastify.register(signer, { secret })

    fastify.ready(async err => {
      t.error(err)
      const signedString = await fastify.sign(testString)

      t.type(signedString, 'string')

      const [value, timestamp, signature] = signedString.split(delimiter)
      t.is(value, testString)
      t.ok(isValidTimestamp(timestamp))
      t.is(signature, (await fastify.sign(testString, { timestamp })).split(delimiter)[2], 'sign returns a reproducable signature')
    })
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
