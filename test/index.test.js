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
    const expectedSignedString = 'test@example.com:1611274828425:e/X8iNL8xP5DB0MkpGo6kZa07h7Miu+61rn6h8DOIwszcZdCizOdFOU7w6O2xIapkWoLyLubo/lVMtjNrlwf4g=='
    const fastify = Fastify()

    fastify.register(signer, { secret })

    await fastify.ready()
    const signedString = await fastify.sign(testString, { timestamp: testTimestamp, salt: testSalt })
    t.is(signedString, expectedSignedString)
  })
  test('assigns default values in absence of options', async t => {
    const expectedSignedString = 'test@example.com:1611274828425:1hfFj1yUPuGmTw0f2KcNIxcRbQN76v3u2A+ulE3k+5MSI3mvZsDGB3LHPWTg6Q1deg+aRhkvVXbhObIyV7wWHQ=='
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

test('validate method:', t => {
  t.test('Returns true if signature is authenticated and timestamp is not expired', async t => {
    const fastify = Fastify()

    const signedString = 'test@example.com:1611274828425:e/X8iNL8xP5DB0MkpGo6kZa07h7Miu+61rn6h8DOIwszcZdCizOdFOU7w6O2xIapkWoLyLubo/lVMtjNrlwf4g=='
    fastify.register(signer, { secret })
    await fastify.ready()
    const clock = useFakeTimers((new Date(testTimestamp)).getTime() + (1000 * 60 * 5))

    const validated = await fastify.validate(signedString, 5, { salt: testSalt })
    clock.restore()
    t.is(validated, true)
  })
  t.test('Returns false if signature is not valid', async t => {
    const fastify = Fastify()
    const signedString = 'test@example.com:1611274828425:e/X8iNL8xP5DB0MkpGo6kZa07h7Miu+61rn6h8DOIwszcZdCizOdFOU7w6O2xIapkWoLyLubo/lVMtjNrlwf4h=='
    fastify.register(signer, { secret })
    await fastify.ready()
    const clock = useFakeTimers((new Date(testTimestamp)).getTime() + (1000 * 60 * 5))

    const validated = await fastify.validate(signedString, 5, { salt: testSalt })
    clock.restore()
    t.is(validated, false)
  })
  t.test('Returns false if signature is different length than expected', async t => {
    const fastify = Fastify()

    const signedString = 'test@example.com:1611274828425:BAD_SIGNATURE'
    fastify.register(signer, { secret })
    await fastify.ready()
    const clock = useFakeTimers((new Date(testTimestamp)).getTime() + (1000 * 60 * 5))

    const validated = await fastify.validate(signedString, 5, { salt: testSalt })
    clock.restore()
    t.is(validated, false)
  })
  t.test('Returns false if timestamp is expired', async t => {
    const fastify = Fastify()

    const signedString = 'test@example.com:1611274828425:e/X8iNL8xP5DB0MkpGo6kZa07h7Miu+61rn6h8DOIwszcZdCizOdFOU7w6O2xIapkWoLyLubo/lVMtjNrlwf4g=='
    fastify.register(signer, { secret })

    await fastify.ready()
    const clock = useFakeTimers((new Date(testTimestamp)).getTime() + (1000 * 60 * 6))

    const validated = await fastify.validate(signedString, 5, { salt: testSalt })
    clock.restore()
    t.is(validated, false)
  })

  t.end()
})
