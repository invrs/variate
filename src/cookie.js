import factory from "./factory"
import Cookies from "js-cookie"

class Cookie {
  init() {
    let cache = Cookies.getJSON("variate") || {}
    this.state({ cache })
    this.pattern({
      convertedKey: { converted: true },
      setCookie: { cached: c => !c }
    })
  }

  cacheStatus({ key, state: { cache } }) {
    return { cached: !!cache[key] }
  }

  convertedKey({ name }) {
    return { key: `c:${name}` }
  }

  getCache({ cached, name, state: { cache } }) {
    if (cached) {
      return { variant: cache[name] }
    }
  }

  key({ name }) {
    return { key: name }
  }

  get({ chain: { each } }) {
    return each(
      this.key,
      this.convertedKey,
      this.cacheStatus,
      this.getCache
    )
  }

  set({ key, variant, chain: { each }, state: { cache } }) {
    return each(
      this.key,
      this.convertedKey,
      this.cacheStatus,
      this.setCache,
      this.setCookie
    )
  }

  setCache({ converted, key, variant, state: { cache } }) {
    if (converted) {
      cache[key] = 1
    } else {
      cache[key] = variant
    }
    this.state({ cache })
    return {}
  }

  setCookie({ cached, state: { cache, cookie } }) {
    Cookies.set("variate", cache, cookie)
    return {}
  }
}

export default factory(Cookie)
