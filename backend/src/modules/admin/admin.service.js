import Signal from '../../models/Signal.js';
import User from '../../models/User.js';
// import Transaction from '../../models/Transaction.js'; // To be added later

class AdminService {
  async getDashboardStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [activeSignals, signalsToday, totalUsers] = await Promise.all([
      Signal.countDocuments({ status: 'ACTIVE' }),
      Signal.countDocuments({ createdAt: { $gte: today } }),
      User.countDocuments({ role: 'USER' }),
    ]);

    // Mock revenue for now
    const revenue = 125000; 

    return {
      activeSignals,
      signalsToday,
      totalUsers,
      revenue
    };
  }

  async getLiveFeed() {
    return await Signal.find().sort({ createdAt: -1 }).limit(10);
  }
}

export default new AdminService();
