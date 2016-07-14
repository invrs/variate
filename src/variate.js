import factory from "./factory"

class Variate {
  init({ cookie }) {
    this.cookie(cookie)
  }

  pattern() {
    let server = () => typeof document == "undefined"
    return {
      callCallback: ({ cached }) => !server() && !cached,
      selectFirstVariant: () => server(),
      selectRandomVariant: () => !server()
    }
  }

  callCallback({ state: { callback } }) {
    if (callback) {
      return [ callback ]
    }
    return {}
  }

  convert() {
    return [
      this.getTest,
      this.selectFirstVariant,
      this.selectRandomVariant,
      this.cookie().get,
      this.cookie().set,
      this.setConverted,
      this.cookie().get,
      this.callCallback,
      this.cookie().set,
      this.returnVariant
    ]
  }

  getTest({ name, state: { tests } }) {
    return { test: tests[name] }
  }

  returnVariant({ variant }) {
    return variant
  }

  selectFirstVariant({ test }) {
    return { variant: test[0] }
  }

  selectRandomVariant({ test }) {
    let index = Math.random() * test.length
    index = Math.floor(index)
    return { variant: test[index] }
  }

  setConverted() {
    return { converted: true }
  }

  test() {
    return [
      this.getTest,
      this.selectFirstVariant,
      this.selectRandomVariant,
      this.cookie().get,
      this.callCallback,
      this.cookie().set,
      this.returnVariant
    ]
  }

  updated() {
    this.cookie(this.state())
  }
}

export default factory(Variate)
