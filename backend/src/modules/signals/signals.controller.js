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
}

export default new SignalsController();
