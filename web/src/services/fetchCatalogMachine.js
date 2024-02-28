import { createMachine } from 'xstate';

export default createMachine({
  id: 'fetchCatalog',
  initial: 'idle',
  states: {
    idle: {
      type: 'parallel',
      on: {
        RESOLVE: 'success',
      },
      states: {
        products: {
          initial: 'idle',
          states: {
            idle: {
              on: {
                'LOAD.products': 'loading',
              },
            },
            loading: {
              entry: 'showLoading',
              exit: 'hideLoading',
              on: {
                'RESOLVE.products': 'success',
                'REJECT.products': 'failure',
              },
            },
            success: {
              type: 'final',
            },
            failure: {
              type: 'final',
              entry: 'sendMessage',
            },
          },
        },
        categories: {
          initial: 'idle',
          states: {
            idle: {
              on: {
                'LOAD.categories': 'loading',
              },
            },
            loading: {
              entry: 'showLoading',
              exit: 'hideLoading',
              on: {
                'RESOLVE.categories': 'success',
                'REJECT.categories': 'failure',
              },
            },
            success: {
              type: 'final',
            },
            failure: {
              type: 'final',
              entry: 'sendMessage',
            },
          },
        },
      },
      onDone: [
        { target: 'success', cond: 'areAllSuccess' },
        { target: 'failure' },
      ],
    },
    success: {
      initial: 'idle',
      states: {
        idle: {
          entry: 'updateData',
          on: {
            FETCH: 'fetching',
          },
        },
        fetching: {
          entry: 'showLoading',
          exit: 'hideLoading',
          on: {
            NOFETCH: { target: 'idle' },
          },
        },
      },
    },
    failure: {
      type: 'final',
    },
  },
});
