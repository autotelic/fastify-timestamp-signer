# fastify-timestamp-signer

A [Fastify](https://www.fastify.io/) plugin to timestamp/cryptographically sign strings and validate that signed strings have not been tampered with. 

### Usage

```sh
npm i @autotelic/fastify-timestamp-signer
```

#### Examples

##### Plugin Usage
```js
// index.js
const signer = require('@autotelic/fastify-timestamp-singer')

// register fastify-timestamp-signer
fastify.register(signer, { secret: 'secret-string' })

// sign route
fastify.get('/sign/:value', async (req, reply) => {
  const { params: { value } } = req

  const signedString = await fastify.sign(value, { salt: 'example-salt' })

  reply.send({ signedString })
})

// validate route
fastify.post('/validate', async (req, reply) => {
  const { body: { signedString } } = req
  const maxAge = 10
  const validated = await fastify.validate(signedString, maxAge, { salt: 'example-salt' })
  reply.send({ validated })
})
```

#### Example App
see [/example.js](./example.js) for a working example app.

### API

#### Configuration

The plugin accepts the the following configuration properties:
  - **`secret`** : `string` - The secret used to sign/ validate a string (required).

  - **`algorithm`** : `string` - The algorithm used to sign/ validate a string (defaults to `sha512`).

  - **`delimiter`**: `string` - The delimiter used to separate the raw string, timestamp and signature (defaults to `:`).

  - **`encoding`**: `string` - The encoding type used to encode the signature. (defaults to `base64`)

#### Decorators

This plugin decorates fastify with the following methods:

- **`sign`**: `function` - Generates a timestamp and cryptographically signed string. 
  - Accepts the following arguments: 
    - **`string`**: `string` - The raw string to be signed (required).
    - **`options`**: `object` - Accepts the following parameters:
      - **`salt`**: `string` - The salt used to hash the signature (required).
      - **`timestamp`**: `number` - A unix timestamp used to timestamp the string (defaults to current time).
  - Returns: `string` - A timestamped and cryptographically signed string.

- **`validate`**: `function` - Validates a signed string has a valid signature and has not expired. 
  - Accepts the following arguments: 
    - **`signedString`**: `string` - The signed string to be validated (required).
    - **`maxAge`**: `number` - The max allowable age in minutes to validate a signed string. (defaults to 5)
    - **`options`**: `object` - Accepts the following parameters:
      - **`salt`**: `string` - The salt used to validate the signature (required).
      - **`validateTime`**: `number` - A unix timestamp representing when validation occurs (defaults to current time).
