import factory from "./factory"
import Cookies from "js-cookie"

class Cookie {
  init() {
    this.cache = Cookies.getJSON("variate") || {}
  }

  pattern() {
    return {
      convertedKey: { converted: true },
      getCache: { cached: true },
      setCookie: { cached: c => !c }
    }
  }

  cacheStatus({ key }) {
    return { cached: !!this.cache[key] }
  }

  convertedKey({ name }) {
    return { key: `c:${name}` }
  }

  getCache({ name }) {
    return { variant: this.cache[name] }
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

  setCache({ converted, key, variant }) {
    this.cache[key] = converted ? 1 : variant
    return {}
  }

  setCookie({ state: { cookie } }) {
    Cookies.set("variate", this.cache, cookie)
    return {}
  }
}

export default factory(Cookie)
