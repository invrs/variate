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

  run({ name, test, variant, converted, args, state: { cache, callback } }) {
    let { value } = this.cached({ callback, name, variant, converted })

    if (!value && callback) {
      callback({ name, test, variant, converted })
    }
    
    return value
  }
}

export default factory(CallbackStore)
