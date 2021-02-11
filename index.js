'use strict'

const fastifyPlugin = require('fastify-plugin')
const { createHmac, timingSafeEqual } = require('crypto')

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
    return createHmac(algorithm, secret)
      .update(salt)
      .digest(encoding)
      .toString()
  }

  const getSignature = async (string, salt) => {
    const key = await deriveKey(salt)

    return createHmac(algorithm, key)
      .update(string)
      .digest(encoding)
      .toString()
  }

  const sign = async (string, options = {}) => {
    const {
      timestamp = new Date().getTime(),
      salt = 'fastify-timestamp-signer'
    } = options

    const timestampedString = string.concat(delimiter, timestamp)
    const signedString = timestampedString.concat(delimiter, await getSignature(timestampedString, salt))

    return signedString
  }

  const validate = async (signedString, maxAge = 5, options = {}) => {
    const { salt = 'fastify-timestamp-signer', validateTime = new Date().getTime() } = options

    if (!signedString.includes(delimiter)) return false

    const [string, timestamp, signature] = signedString.split(delimiter)

    const timestampedString = string.concat(delimiter, timestamp)
    const expectedSignature = await getSignature(timestampedString, salt)

    const signatureBuffer = Buffer.from(signature)
    const expectedSignatureBuffer = Buffer.from(expectedSignature)

    if (signatureBuffer.length !== expectedSignatureBuffer.length) {
      return false
    }

    if (!timingSafeEqual(signatureBuffer, expectedSignatureBuffer)) {
      return false
    }

    const minutesElapsed = (validateTime - timestamp) / (60 * 1000)

    if (minutesElapsed > maxAge) {
      return false
    }

    return true
  }

  fastify.decorate('sign', sign)
  fastify.decorate('validate', validate)
}

module.exports = fastifyPlugin(fastifyTimestampSigner, {
  name: 'fastify-timestamp-signer'
})
