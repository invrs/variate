import factory from "./factory"

class Variate {
  init({ cookie }) {
    this.cookie(cookie)
  }

  pattern() {
    let server = () => typeof document == "undefined"
    return {
      callCallback:        ({ cached }) => !server() && !cached,
      callRemoteCallback:  ({ cached }) => !server() && !cached,
      postConversion:      ({ cached }) => !server() && !cached,
      selectFirstVariant:  () => server(),
      selectRandomVariant: () => !server()
    }
  }

  callCallback({ args, state: { callback } }) {
    if (callback) { callback(args) }
    return {}
  }

  callRemoteCallback({ args, state: { remoteCallback } }) {
    if (remoteCallback) { remoteCallback(args) }
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

  postConversion() {
    return [ this.remote().postConversion ]
  }

  remoteConvert() {
    return [
      this.cookie().get,
      this.setConverted,
      this.cookie().get,
      this.callRemoteCallback,
      this.cookie().set,
      this.postConversion,
      this.returnVariant
    ]
  }

  remoteTest() {
    return [
      this.remote().getVariant,
      this.cookie().get,
      this.callRemoteCallback,
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
