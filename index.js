'use strict'

const fastifyPlugin = require('fastify-plugin')
const crypto = require('crypto')

const fastifyTimestampSigner = async (fastify, options) => {
  const {
    secret,
    algorithm = 'sha512',
    salt = 'fastify-timestamp-singer',
    delimiter = ':',
    encoding = 'base64'
  } = options

  if (!secret || typeof secret !== 'string') {
    throw new Error('secret in options object is missing or not a string')
  }

  const deriveKey = async () => {
    return crypto
      .createHmac(algorithm, secret)
      .update(salt)
      .digest(encoding)
      .toString()
  }

  const getSignature = async (str) => {
    const key = await deriveKey(secret)

    return crypto
      .createHmac(algorithm, key)
      .update(str)
      .digest(encoding)
      .toString()
  }

  const sign = async (str) => {
    const timestamp = new Date().getTime()

    str = str.concat(delimiter, timestamp)

    return str.concat(delimiter, await getSignature(str))
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
