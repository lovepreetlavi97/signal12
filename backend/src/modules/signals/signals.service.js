import signalsRepository from './signals.repository.js';
import socketService from '../../loaders/socket.js';
import { parseSignal } from '../../services/parser.service.js';

class SignalsService {
  async getAllSignals() {
    return await signalsRepository.findAll();
  }

  async createSignal(text, source) {
    const signalData = parseSignal(text);
    
    const saved = await signalsRepository.create({
      ...signalData,
      source: source || 'MANUAL-TEST',
      status: 'ACTIVE',
    });

    socketService.emit('new_signal', saved);
    return saved;
  }

  async createManualSignal(data) {
    const saved = await signalsRepository.create({
      ...data,
      source: 'ADMIN-MANUAL',
      status: 'ACTIVE'
    });
    socketService.emit('new_signal', saved);
    return saved;
  }

  async deleteSignal(id) {
    return await signalsRepository.delete(id);
  }
}

export default new SignalsService();
