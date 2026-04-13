import adminService from './admin.service.js';

class AdminController {
  async getStats(request, reply) {
    const stats = await adminService.getDashboardStats();
    return stats;
  }

  async getFeed(request, reply) {
    const feed = await adminService.getLiveFeed();
    return feed;
  }
}

export default new AdminController();
