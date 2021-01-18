const { test } = require('tap')
const Fastify = require('fastify')
const signer = require('.')

const secret = 'secret'

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
