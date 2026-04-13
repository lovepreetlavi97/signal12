import subscriptionsRepository from './subscriptions.repository.js';
import AppError from '../../utils/appError.js';

class SubscriptionsService {
  async listPackages(isAdmin = false) {
    if (isAdmin) return await subscriptionsRepository.getAdminPackages();
    return await subscriptionsRepository.getAllPackages();
  }

  async createPackage(packageData) {
    return await subscriptionsRepository.createPackage(packageData);
  }

  async buyPackage(userId, packageId) {
    const pkg = await subscriptionsRepository.findPackageById(packageId);
    if (!pkg || !pkg.isActive) {
      throw new AppError('Package not found or inactive', 404);
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + pkg.durationInDays);

    const subscriptionData = {
      plan: pkg.name,
      startDate,
      endDate,
      isActive: true
    };

    return await subscriptionsRepository.updateUserSubscription(userId, subscriptionData);
  }

  async deletePackage(id) {
    return await subscriptionsRepository.deletePackage(id);
  }
}

export default new SubscriptionsService();
