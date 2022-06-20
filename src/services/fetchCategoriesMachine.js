import { createMachine } from 'xstate';

export default createMachine({
  id: 'fetchCategories',
  initial: 'idle',
  states: {
    idle: {
      on: {
        LOAD: 'loading',
        RESOLVE: 'success',
      },
    },
    loading: {
      on: {
        RESOLVE: 'success',
        REJECT: 'failure',
      },
    },
    success: {
      entry: 'expandParents',
    },
    failure: {
      type: 'final',
      entry: 'sendMessage',
    },
  },
});
