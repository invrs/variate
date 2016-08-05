import factory from "./factory"

class Variate {
  init({ cookie }) {
    this.cookie(cookie)
  }

  pattern() {
    let server = () => typeof document == "undefined"
    return {
      callCallback:        ({ cached }) => !server() && !cached,
      getVariant:          ({ cached }) => !cached,
      postConversion:      ({ cached }) => !server() && !cached,
      selectFirstVariant:  () => server(),
      selectRandomVariant: () => !server()
    }
  }

  callCallback({ args, state: { callback } }) {
    if (callback) { callback(args) }
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
      this.cookie().set,
      this.callCallback,
      this.returnVariant
    ]
  }

  getTest({ name, state: { tests } }) {
    return { test: tests[name] }
  }

  getVariant() {
    return [ this.remote().getVariant ]
  }

  postConversion() {
    return [ this.remote().postConversion ]
  }

  remoteConvert() {
    return [
      this.cookie().get,
      this.setConverted,
      this.cookie().get,
      this.cookie().set,
      this.postConversion,
      this.memory().get,
      this.returnVariant
    ]
  }

  remoteTest() {
    return [
      this.memory().get,
      this.getVariant,
      this.memory().set,
      this.cookie().get,
      this.cookie().set,
      this.returnVariant
    ]
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
    this.remote(this.state())
  }
}

export default factory(Variate)
