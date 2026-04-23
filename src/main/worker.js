const { parentPort, workerData } = require('worker_threads')
const { runConversion } = require('../core/convert')

const listeners = {
  log: (message) => parentPort.postMessage({ type: 'log', message }),
  progress: (payload) => parentPort.postMessage({ type: 'progress', payload }),
}

runConversion(workerData.config, listeners)
  .then((result) => {
    parentPort.postMessage({ type: 'done', result })
  })
  .catch((error) => {
    parentPort.postMessage({
      type: 'error',
      error: error && error.message ? error.message : String(error),
    })
  })
