'use strict'

const signer = require('.')

const secret = 'secret'

module.exports = async function (fastify, options) {
  fastify.register(signer, { secret })
}
