require('../../runOnAll')

const { workerData, parentPort } = require('worker_threads')

const Worker = require('./Worker')

const worker = new Worker(workerData, parentPort)

module.exports = worker
