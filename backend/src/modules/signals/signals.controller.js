import signalsService from './signals.service.js';

class SignalsController {
  async getSignals(request, reply) {
    const signals = await signalsService.getAllSignals();
    return signals;
  }

  async testSignal(request, reply) {
    const { text, source } = request.body;
    const signal = await signalsService.createSignal(text, source);
    return { status: 'ok', data: signal };
  }

  async createSignal(request, reply) {
    const signal = await signalsService.createManualSignal(request.body);
    return { status: 'ok', data: signal };
  }

  async deleteSignal(request, reply) {
    const { id } = request.params;
    await signalsService.deleteSignal(id);
    return { status: 'ok' };
  }
}

export default new SignalsController();
