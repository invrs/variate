import factory from "./factory"
import Cookies from "js-cookie"

class Cookie {
  init() {
    this.state({ cookie: { expires: 10 * 365 } })
  }

  read({ name }) {
    if (typeof document == "undefined") {
      return {}
    } else {
      return { variant: Cookies.get(name) }
    }
  }

  write({ name, variant, state: { cookie } }) {
    if (typeof document == "undefined") {
      return {}
    } else {
      return Cookies.set(name, variant, cookie)
    }
  }
}

export default factory(Cookie)
