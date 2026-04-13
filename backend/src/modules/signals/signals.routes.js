import signalsController from './signals.controller.js';

export default async function (fastify, opts) {
  fastify.get('/', signalsController.getSignals);
  fastify.post('/test', signalsController.testSignal);
}
