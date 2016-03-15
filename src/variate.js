import factory from "./variate/factory"

class Variate {

  convert({ args, include: { callbackStore, cookie }, state: { callback, tests } }) {
    args = {
      ...args,
      ...this.getTest(args),
      ...cookie().read(args)
    }

    if (!args.variant) {
      throw new Error("convert() called before test()")
    }

    return callbackStore().run({ ...args, converted: true })
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

  test({ args, include: { callbackStore, cookie }, state: { tests } }) {
    args = {
      ...args,
      ...this.getTest(args),
      ...cookie().read(args)
    }

    if (!args.variant) {
      args = {
        ...args,
        ...this.randomVariant(args)
      }
      cookie().write(args)
    }

    callbackStore().run(args)

    return args.variant
  }

  updated({ state, include: { callbackStore, cookie } }) {
    callbackStore(state)
    cookie(state)
  }
}

export default factory(Variate)
