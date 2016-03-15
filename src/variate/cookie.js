import factory from "./factory"
import Cookies from "js-cookie"

class Cookie {
  init() {
    this.state({ cookie: { expires: 10 * 365 } })
  }

  read({ name }) {
    return { variant: Cookies.get(name) }
  }

  write({ name, variant, state: { cookie } }) {
    return Cookies.set(name, variant, cookie)
  }
}

export default factory(Cookie)
