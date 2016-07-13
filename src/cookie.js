import factory from "./factory"
import Cookies from "js-cookie"

class Cookie {
  init() {
    let cache = Cookies.getJSON("variate") || {}
    this.state({ cache })
  }

  pattern() {
    return {
      convertedKey: { converted: true },
      getCache: { cached: true },
      setCookie: { cached: c => !c }
    }
  }

  cacheStatus({ key, state: { cache } }) {
    return { cached: !!cache[key] }
  }

  convertedKey({ name }) {
    return { key: `c:${name}` }
  }

  getCache({ name, state: { cache } }) {
    return { variant: cache[name] }
  }

  key({ name }) {
    return { key: name }
  }

  get() {
    return [
      this.key,
      this.convertedKey,
      this.cacheStatus,
      this.getCache
    ]
  }

  set() {
    return [
      this.key,
      this.convertedKey,
      this.cacheStatus,
      this.setCache,
      this.setCookie
    ]
  }

  setCache({ converted, key, variant, state: { cache } }) {
    cache[key] = converted ? 1 : variant
    this.state({ cache })
    return {}
  }

  setCookie({ state: { cache, cookie } }) {
    Cookies.set("variate", cache, cookie)
    return {}
  }
}

export default factory(Cookie)
