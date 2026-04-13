import Signal from '../../models/Signal.js';

class SignalsRepository {
  async findAll(limit = 50) {
    return await Signal.find().sort({ createdAt: -1 }).limit(limit);
  }

  async findById(id) {
    return await Signal.findById(id);
  }

  async create(signalData) {
    return await Signal.create(signalData);
  }

  async update(id, updateData) {
    return await Signal.findByIdAndUpdate(id, updateData, { new: true });
  }

  async delete(id) {
    return await Signal.findByIdAndDelete(id);
  }
}

export default new SignalsRepository();
