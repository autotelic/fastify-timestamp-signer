'use strict'

const signer = require('.')

const secret = 'secret'
const algorithm = 'sha512'

module.exports = async function (fastify, options) {
  fastify.register(signer, { secret, algorithm })

  fastify.get('/sign/:value', async (req, reply) => {
    const { params: { value } } = req

    const signedString = await fastify.sign(value)

    reply.send({ signedString })
  })
}
