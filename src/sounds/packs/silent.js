const noop = () => {}

export default {
  id: 'silent',
  name: 'Silent',
  description: 'No sound feedback.',
  events: {
    windowOpen: noop,
    windowClose: noop,
    windowMinimize: noop,
    windowMaximize: noop,
    notification: noop,
    login: noop,
    logout: noop,
    startup: noop,
    error: noop,
    success: noop,
  },
}
