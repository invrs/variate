import factory from "./variate/factory"

class Variate {

  convert({ name, include: { callbackStore, cookie }, state: { callback, tests } }) {
    let { test } = this.getTest({ name })
    let { variant } = cookie().read({ name })

    if (!variant) {
      throw new Error("convert() called before test()")
    }

    return callbackStore().run({
      name, test, variant, converted: true
    })
  }

  getTest({ name, state: { tests } }) {
    let test = tests[name]

    if (!test) {
      throw new Error("test not found")
    }

    return { test }
  }

  randomVariant({ test }) {
    let index = Math.random() * test.length
    index = Math.floor(index)

    return { variant: test[index] }
  }

  test({ name, include: { callbackStore, cookie }, state: { tests } }) {
    let { test } = this.getTest({ name })
    let { variant } = cookie().read({ name })

    if (!variant) {
      variant = this.randomVariant({ test }).variant
      cookie().write({ name, variant })
    }

    callbackStore().run({ name, test, variant })

    return variant
  }

  updated({ state, include: { callbackStore, cookie } }) {
    callbackStore(state)
    cookie(state)
  }
}

export default factory(Variate)
