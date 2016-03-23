import factory from "./factory"
import Cookies from "js-cookie"

class Cookie {
  init() {
    this.state({ cookie: { expires: 10 * 365 } })
  }

  get({ key }) {
    if (typeof document == "undefined") {
      return {}
    } else {
      let value = Cookies.getJSON("variate")
      if (value) {
        return { variant: Cookies.getJSON("variate")[key] }
      } else {
        return {}      
      }
    }
  }

  key({ name, converted }) {
    let key = [ name ]
    if (converted) {
      key.unshift("c")
    }
    return { key: key.join(":") }
  }

  read({ promise: { chain } }) {
    return chain(
      this.key,
      this.get
    )
  }

  set({ key, variant, state: { cookie } }) {
    if (typeof document == "undefined") {
      return {}
    } else {
      let value = Cookies.getJSON("variate") || {}
      value[key] = variant
      return Cookies.set("variate", value, cookie)
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
