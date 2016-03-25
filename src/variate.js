import factory from "./variate/factory"

class Variate {

  init() {
    this.state({ client: typeof document != "undefined" })
  }

  convert({ include: { cookie }, promise: { chain }, state: { client } }) {
    if (!client) { return }

    return chain(
      this.getTest,
      cookie().read,
      this.throwUnlessVariant,
      this.setConverted,
      cookie().read,
      this.convertUnlessVariant
    )
  }

  getTest({ name, state: { tests } }) {
    let test = tests[name]

    if (!test) {
      throw new Error("test not found")
    }

    return { test }
  }

  randomVariant({ test, state: { client } }) {
    let index = Math.random() * test.length
    index = Math.floor(index)

    if (!client) { index = 0 }

    return { variant: test[index] }
  }

  returnVariant({ variant }) {
    return variant
  }

  convertUnlessVariant({ variant, include: { cookie }, promise: { chain }, state: { callback } }) {
    if (!variant) {
      return chain(
        this.unsetConverted,
        cookie().read,
        this.setConverted,
        callback,
        cookie().write
      )
    }
  }

  setConverted() {
    return { converted: true }
  }

  test({ include: { cookie }, promise: { chain } }) {
    return chain(
      this.getTest,
      cookie().read,
      this.testUnlessVariant
    )
  }

  testUnlessVariant({ variant, promise: { chain }, state: { callback } }) {
    if (variant) {
      return chain(this.returnVariant)
    } else {
      return chain(
        this.writeVariant,
        callback,
        this.returnVariant
      )
    }
  }

  throwUnlessVariant({ variant }) {
    if (!variant) {
      throw new Error("convert() called before test()")
    } else {
      return {}
    }
  }

  unsetConverted() {
    return { converted: false }
  }

  updated({ state, include: { cookie } }) {
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
