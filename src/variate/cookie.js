import factory from "./factory"
import Cookies from "js-cookie"

class Cookie {
  init() {
    let client = typeof document != "undefined"
    
    this.state({
      client,
      cookie: { expires: 10 * 365 }
    })
    
    if (client) {
      this.state({ cache: Cookies.getJSON("variate") || {} })
    }
  }

  get({ key, state: { cache, client } }) {
    if (client) {
      return { variant: cache[key] }
    }
  }

  key({ name, converted }) {
    let key = [ name ]
    if (converted) { key.unshift("c") }
    return { key: key.join(":") }
  }

  read({ promise: { chain } }) {
    return chain(
      this.key,
      this.get
    )
  }

  set({ converted, key, variant, state: { cache, client, cookie } }) {
    if (client) {
      cache[key] = converted || variant
      Cookies.set("variate", cache, cookie)
      this.state({ cache: cache })
      return { variant: cache[key] }
    }
  }

  write({ promise: { chain } }) {
    return chain(
      this.key,
      this.set
    )
  }
}

export default factory(Cookie)
