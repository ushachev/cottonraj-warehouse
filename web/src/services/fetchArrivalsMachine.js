import { createMachine } from 'xstate';

export default createMachine({
  id: 'fetchArrivals',
  initial: 'idle',
  states: {
    idle: {
      on: {
        LOAD: 'loading',
        RESOLVE: 'success',
      },
    },
    loading: {
      entry: 'showLoading',
      exit: 'hideLoading',
      on: {
        RESOLVE: 'success',
        REJECT: 'failure',
      },
    },
    success: {
      entry: 'updateData',
    },
    failure: {
      type: 'final',
      entry: 'sendMessage',
    },
  },
});
