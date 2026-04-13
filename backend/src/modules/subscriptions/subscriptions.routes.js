import subscriptionsController from './subscriptions.controller.js';

export default async function (fastify, opts) {
  // Public/User routes
  fastify.get('/packages', subscriptionsController.getPackages);
  fastify.post('/buy', subscriptionsController.subscribe);

  // Admin routes (Ideally protected by role check middleware)
  fastify.get('/admin/packages', subscriptionsController.getPackagesAdmin);
  fastify.post('/admin/packages', subscriptionsController.createPackage);
  fastify.delete('/admin/packages/:id', subscriptionsController.deletePackage);
}
