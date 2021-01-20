'use strict'

const fastifyPlugin = require('fastify-plugin')
const crypto = require('crypto')

const { generateTimestamp } = require('./lib/helpers')
const { SHA_512, BASE_64 } = require('./lib/constants')

const fastifyTimestampSigner = async (fastify, options) => {
  const {
    secret,
    algorithm = SHA_512,
    delimiter = ':',
    encoding = BASE_64
  } = options

  if (!secret || typeof secret !== 'string') {
    throw new Error('secret in options object is missing or not a string')
  }

  const deriveKey = async (salt) => {
    return crypto
      .createHmac(algorithm, secret)
      .update(salt)
      .digest(encoding)
      .toString()
  }

  const getSignature = async (str, salt) => {
    const key = await deriveKey(salt)

    return crypto
      .createHmac(algorithm, key)
      .update(str)
      .digest(encoding)
      .toString()
  }

  const sign = async (str, options) => {
    options = options || {}
    const {
      timestamp = generateTimestamp(),
      salt = 'fastify-timestamp-signer'
    } = options

    str = str.concat(delimiter, timestamp)

    return str.concat(delimiter, await getSignature(str, salt))
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
