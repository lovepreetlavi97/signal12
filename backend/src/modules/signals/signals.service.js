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
}

export default new SignalsService();
