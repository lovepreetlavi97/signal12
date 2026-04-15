import subscriptionsController from './subscriptions.controller.js';

export default async function (fastify, opts) {
  // Public/User routes
  fastify.get('/packages', subscriptionsController.getPackages);
  fastify.post('/buy', subscriptionsController.subscribe);
}
