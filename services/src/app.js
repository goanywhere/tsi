const job = require('./jobs/mail-populator');
const messages = require('./routes/messages');

/**
 * Start email polling job
 */
job.startPolling()

const fastify = require('fastify')({
    logger: true
})

fastify.use(async (req, reply, next) => {
    reply.setHeader('Access-Control-Allow-Origin', "*")
    next()
})

messages.forEach(rec => {
    const func = new rec()
    fastify[func.method](func.route, func.callBack)
})

// Declare a route
fastify.get('/', function (request, reply) {
    reply.send({ hello: 'world' })
})

// Run the server!
fastify.listen(3000, '0.0.0.0', (err, address) => {
    if (err) throw err
    fastify.log.info(`server listening on ${address}`)
})