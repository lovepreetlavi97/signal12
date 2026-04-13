import adminController from './admin.controller.js';

export default async function (fastify, opts) {
  fastify.get('/stats', adminController.getStats);
  fastify.get('/feed', adminController.getFeed);
}
