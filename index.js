'use strict'

const fastifyPlugin = require('fastify-plugin')
const crypto = require('crypto')

const fastifyTimestampSigner = async (fastify, options) => {
  const {
    secret,
    algo = 'sha512',
    salt = 'fastify-timestamp-singer',
    sep = ':',
    encoding = 'base64'
  } = options

  if (!secret || typeof secret !== 'string') {
    throw new Error('secret in options object is missing or not a string')
  }

  const deriveKey = async () => {
    return crypto
      .createHmac(algo, secret)
      .update(salt)
      .digest(encoding)
      .toString()
  }

  const getSignature = async (str) => {
    const key = await deriveKey(secret)

    return crypto
      .createHmac(algo, key)
      .update(str)
      .digest(encoding)
      .toString()
  }

  const sign = async (str) => {
    const timestamp = new Date().getTime()

    str = str.concat(sep, timestamp)

    return str.concat(sep, await getSignature(str))
  }

  const validate = (str) => {
    return str
  }

  fastify.decorate('sign', sign)
  fastify.decorate('validate', validate)
}

module.exports = fastifyPlugin(fastifyTimestampSigner, {
  name: 'fastify-timestamp-signer'
})
