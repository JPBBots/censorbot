const { workerData, parentPort } = require('worker_threads')

const Worker = require('./DashboardWorker')

const worker = new Worker(workerData, parentPort)

module.exports = worker
