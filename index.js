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

  const getSignature = async (value) => {
    const key = await deriveKey(secret)

    return crypto
      .createHmac(algo, key)
      .update(value)
      .digest(encoding)
      .toString()
  }

  const sign = async (str, expiresIn = 5) => {
    const timeNow = new Date().getTime()
    const timeStamp = new Date(timeNow + expiresIn * 60000).getTime()

    str = str.concat(sep, timeStamp)

    return str.concat(sep, await getSignature(secret))
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
