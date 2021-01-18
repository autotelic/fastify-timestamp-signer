'use strict'

const fastifyPlugin = require('fastify-plugin')

const fastifyTimestampSigner = async (fastify, options) => {
  const { secret } = options
  if (!secret || typeof secret !== 'string') {
    throw new Error('secret in options object is missing or not a string')
  }

  const sign = (str) => {
    return str
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
