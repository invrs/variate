import factory from "./factory"

class CallbackStore {
  init() {
    this.state({ cache: {} })
  }

  cached({ name, variant, converted, state: { cache, callback } }) {
    let key = `${name}:${variant}:${converted}`
    let value = cache[key]

    if (callback) {
      cache[key] = true
      this.state({ cache })
    }

    return value
  }

  callback({ args, value, state: { callback } }) {
    if (!value && callback) {
      callback(args)
    }
    return value || {}
  }

  run({ promise: { chain } }) {
    return chain(
      this.cached,
      this.callback
    )
  }
}

export default factory(CallbackStore)
