import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { Signal } from '../../shared/types';

interface SignalState {
  signals: Signal[];
  socket: Socket | null;
  loading: boolean;
  connect: (url: string) => void;
  setSignals: (signals: Signal[]) => void;
  addSignal: (signal: Signal) => void;
  updateSignal: (signal: Signal) => void;
}

export const useSignalStore = create<SignalState>((set) => ({
  signals: [],
  socket: null,
  loading: true,

  connect: (url) => {
    console.log(`📡 Attempting connection to Signal Engine: ${url}`);
    const socket = io(url, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnection: true
    });

    socket.on('connect', () => {
      console.log('✅ Connected to Real-time Neural Engine');
      console.log('Socket ID:', socket.id);
    });

    socket.on('connect_error', (err) => {
      console.error('❌ Connection Error:', err.message);
    });

    socket.on('new_signal', (signal: Signal) => {
      console.log('📥 NEW SIGNAL RECEIVED:', signal.symbol, signal.type);
      set((state) => {
        const newSignals = [signal, ...state.signals].slice(0, 100);
        console.log('🔄 State Update Success. New Count:', newSignals.length);
        return { signals: newSignals, loading: false };
      });
    });

    socket.on('update_signal', (updatedSignal: Signal) => {
      console.log('📝 SIGNAL UPDATED:', updatedSignal.symbol);
      set((state) => ({
        signals: state.signals.map((s) => s._id === updatedSignal._id ? updatedSignal : s)
      }));
    });

    set({ socket });
  },

  setSignals: (signals) => set({ signals, loading: false }),
  addSignal: (signal) => set((state) => ({ signals: [signal, ...state.signals] })),
  updateSignal: (updatedSignal) => set((state) => ({
    signals: state.signals.map((s) => s._id === updatedSignal._id ? updatedSignal : s)
  })),
}));
