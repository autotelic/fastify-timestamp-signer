const { test } = require('tap')
const Fastify = require('fastify')
const isBase64 = require('is-base64')

const signer = require('.')

const testString = 'test@example.com'
const secret = 'secret'
const sep = ':'
const encoding = 'base64'

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

test('sign method returns a signed string', t => {
  t.plan(5)
  const fastify = Fastify()

  fastify.register(signer, { secret, sep, encoding })

  fastify.ready(async err => {
    t.error(err)
    const signedString = await fastify.sign(testString)

    t.type(signedString, 'string')

    const [value, timestamp, signature] = signedString.split(sep)
    t.is(value, testString)
    t.ok(timestamp)
    t.ok(isBase64(signature))
  })
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
