import subscriptionsService from './subscriptions.service.js';

class SubscriptionsController {
  // Admin handlers
  async getPackagesAdmin(request, reply) {
    const packages = await subscriptionsService.listPackages(true);
    return packages;
  }

  async createPackage(request, reply) {
    const pkg = await subscriptionsService.createPackage(request.body);
    return pkg;
  }

  async deletePackage(request, reply) {
    const { id } = request.params;
    await subscriptionsService.deletePackage(id);
    return { status: 'ok', message: 'Package deleted' };
  }

  async updatePackage(request, reply) {
    const { id } = request.params;
    const pkg = await subscriptionsService.updatePackage(id, request.body);
    return pkg;
  }

  // User handlers
  async getPackages(request, reply) {
    const packages = await subscriptionsService.listPackages(false);
    return packages;
  }

  async subscribe(request, reply) {
    const { packageId } = request.body;
    // In a real app, userId comes from decoded JWT
    // For now, using a mock ID until auth is fully implemented
    const userId = request.user?.id || 'mock-user-id'; 
    
    const updatedUser = await subscriptionsService.buyPackage(userId, packageId);
    return { status: 'success', data: updatedUser };
  }
}

export default new SubscriptionsController();
