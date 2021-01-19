'use strict'

const signer = require('.')

const secret = 'secret'
const algo = 'sha512'

module.exports = async function (fastify, options) {
  fastify.register(signer, { secret, algo })

  fastify.get('/sign/:value', async (req, reply) => {
    const { params: { value } } = req

    const signedString = await fastify.sign(value)

    reply.send({ signedString })
  })
}
