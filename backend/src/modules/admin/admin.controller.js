import adminService from './admin.service.js';

class AdminController {
  async getStats(request, reply) {
    const stats = await adminService.getDashboardStats();
    return stats;
  }

  async getLiveFeed(request, reply) {
    const feed = await adminService.getLiveFeed();
    return feed;
  }

  async getUsers(request, reply) {
    return await adminService.getAllUsers();
  }

  async updateUser(request, reply) {
    const { id } = request.params;
    return await adminService.updateUser(id, request.body);
  }

  async deleteUser(request, reply) {
    const { id } = request.params;
    await adminService.deleteUser(id);
    return { status: 'ok' };
  }

  async toggleBanUser(request, reply) {
    const { id } = request.params;
    return await adminService.toggleBanUser(id);
  }
}

export default new AdminController();
