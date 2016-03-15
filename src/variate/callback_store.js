import factory from "./factory"

class CallbackStore {
  init() {
    this.state({ cache: {} })
  }

  cached({ callback, name, variant, converted, state: { cache } }) {
    let key = `${name}:${variant}:${converted}`
    let value = cache[key]

    if (callback) {
      cache[key] = true
      this.state({ cache })
    }

    return value
  }

  run({ args, state: { cache, callback } }) {
    let { value } = this.cached({ ...args, callback })

    if (!value && callback) {
      callback(args)
    }
    
    return value
  }
}

export default factory(CallbackStore)
