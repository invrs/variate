import factory from "./variate/factory"

class Variate {

  convertedFlag() {
    return { converted: true }
  }

  convert({ include: { callbackStore, cookie }, promise: { chain } }) {
    if (typeof document == "undefined") {
      return
    }

    return chain(
      this.getTest,
      cookie().read,
      this.throwUnlessVariant,
      this.convertedFlag,
      callbackStore().run
    )
  }

  getTest({ name, state: { tests } }) {
    let test = tests[name]

    if (!test) {
      throw new Error("test not found")
    }

    return { test }
  }

  randomVariant({ args, test }) {
    let index = Math.random() * test.length
    index = Math.floor(index)

    if (typeof document == "undefined") {
      index = 0
    }

    return { variant: test[index] }
  }

  returnVariant({ args, variant }) {
    return variant
  }

  test({ include: { callbackStore, cookie }, promise: { chain } }) {
    return chain(
      this.getTest,
      cookie().read,
      this.writeVariant,
      callbackStore().run,
      this.returnVariant
    )
  }

  throwUnlessVariant({ variant }) {
    if (!variant) {
      throw new Error("convert() called before test()")
    }
  }

  updated({ state, include: { callbackStore, cookie } }) {
    callbackStore(state)
    cookie(state)
  }

  writeVariant({ variant, include: { cookie }, promise: { chain } }) {
    if (!variant) {
      return chain(
        this.randomVariant,
        cookie().write
      )
    }
  }
}

export default factory(Variate)
