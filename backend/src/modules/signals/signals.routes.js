import signalsController from './signals.controller.js';

export default async function (fastify, opts) {
  fastify.get('/', signalsController.getSignals);
  fastify.post('/', signalsController.createSignal);
  fastify.delete('/:id', signalsController.deleteSignal);
  fastify.post('/test', signalsController.testSignal);
}
