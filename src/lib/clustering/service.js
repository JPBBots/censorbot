const { workerData, parentPort } = require('worker_threads')

if (workerData.beta) process.argv.push('-b')

const Worker = require('./Worker')

const worker = new Worker(workerData, parentPort)

module.exports = worker
