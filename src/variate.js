import factory from "./factory"

class Variate {
  init({ cookie }) {
    this.cookie(cookie)
    this.pattern({
      callCallback: ({ cached }) => typeof document != "undefined" && !cached,
      selectFirstVariant: () => typeof document == "undefined",
      selectRandomVariant: () => typeof document != "undefined"
    })
  }

  callCallback({ chain: { each }, state: { callback } }) {
    if (callback) {
      each(callback)
    }
    return {}
  }

  convert({ chain: { each } }) {
    return each(
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
    )
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

  test({ chain: { each } }) {
    return each(
      this.getTest,
      this.selectFirstVariant,
      this.selectRandomVariant,
      this.cookie().get,
      this.callCallback,
      this.cookie().set,
      this.returnVariant
    )
  }

  updated({ state }) {
    this.cookie(state)
  }
}

export default factory(Variate)
