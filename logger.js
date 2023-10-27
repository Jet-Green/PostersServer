const pino = require('pino');

const fileTransport = pino.transport({
    target: 'pino/file',
    options: { destination: `${__dirname}/logs/today.log` },
});

module.exports = pino(
    fileTransport
);