import factory from "./factory"

class Memory {
  init() {
    this.cache = {}
  }

  pattern() {
    return {
      getCache: { cached: true }
    }
  }

  cacheStatus({ name }) {
    return { cached: !!this.cache[name] }
  }

  getCache({ name }) {
    return this.cache[name]
  }

  get() {
    return [
      this.cacheStatus,
      this.getCache
    ]
  }

  set() {
    return [
      this.cacheStatus,
      this.setCache
    ]
  }

  setCache({ name, variant, data }) {
    this.cache[name] = { variant, data }
    return {}
  }
}

export default factory(Memory)
