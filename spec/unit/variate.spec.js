import variate from "../../"

function loadDocument() {
  global.document = { cookie: undefined }
  variate().init()
}

function unloadDocument() {
  delete global.document
  variate().init()
}

let test  = [ "b", "c" ]
let tests = { a: test }
let variant_data = {
  variant: "aremote", data: { test: "test" }
}

describe("Variate", () => {
  beforeEach(() => {
    loadDocument()
    variate().cookie().cache = {}
    variate().memory().cache = {}
    variate({
      remoteCallback: ({ promise: { resolve }}) => { resolve(variant_data) },
      tests
    })
  })

  afterEach(() => {
    unloadDocument()
  })

  describe("randomVariant", () => {
    it("returns a random variant from a test array", () => {
      let { variant } = variate().selectRandomVariant({ test })
      expect(test.indexOf(variant) > -1).toBe(true)
    })
  })

  describe("updated", () => {
    afterAll(() =>
      variate({ cookie: { expires: undefined } })
    )

    it("sets cookie options", () => {
      let cookie = { expires: 1 }
      variate({ cookie })
      
      expect(variate().cookie().state().cookie).toEqual(cookie)
      expect(variate().cookie().state().tests).toEqual(tests)
    })
  })

  describe("test", () => {
    it("returns a random variant", () => {
      let variant = variate().test({ name: "a" })
      expect(test.indexOf(variant.value) > -1).toBe(true)
    })

    it("returns first variant if document undefined", () => {
      unloadDocument()

      for (let i=0; i<10; i++) {  
        let variant = variate().test({ name: "a" })
        expect(variant.value).toBe("b")
      }
    })

    it("writes to document.cookie", () => {
      let variant = variate().test({ name: "a" }).value
      variate().convert({ name: "a" })

      expect(document.cookie).toEqual(
        `variate={%22a%22:%22${variant}%22%2C%22c:a%22:1}; path=/`
      )
    })

    it("reads from document.cookie", () => {
      variate({ tests })
      let variant = variate().test({ name: "a" }).value

      for (let i of Array(10).keys()) {
        let variant2 = variate().test({ name: "a" }).value
        expect(variant).toEqual(variant2)
      }
    })

    it("calls a callback", done => {
      let callback = ({ name, test, variant, converted }) => {
        expect(name).toBe("a")
        expect(test).toEqual(test)
        expect(test.indexOf(variant) > -1).toBe(true)
        expect(converted).toEqual(undefined)
        done()
      }
      variate({ callback  })
      variate().test({ name: "a" })
    })

    it("doesn't call the callback again", () => {
      let called = false
      let callback = () => called = true
      
      variate({ callback }).cookie().cache = {}
      variate().test({ name: "a" })
      expect(called).toBe(true)

      called = false
      variate().test({ name: "a" })
      expect(called).toBe(false)
    })
  })

  describe("convert", () => {
    it("calls a callback", done => {
      let callback = ({ name, random, test, variant, converted }) => {
        expect(name).toBe("a")
        expect(random).toBe(true)
        expect(test).toEqual(test)
        expect(test.indexOf(variant) > -1).toBe(true)
        expect(converted).toEqual(true)
        done()
      }
      variate().test({ name: "a" })
      variate({ callback  })
      variate().convert({ name: "a", random: true })
    })

    it("doesn't call the callback again", () => {
      let called = false
      let callback = () => called = true
      
      variate({ callback  })
      variate().test({ name: "a" })
      variate().convert({ name: "a" })
      expect(called).toBe(true)

      called = false
      variate().convert({ name: "a" })
      expect(called).toBe(false)
    })

    it("does nothing if document undefined", () => {
      let called = false
      let callback = () => called = true

      variate().test({ name: "a" })
      unloadDocument()
      variate({ callback })

      for (let i=0; i<100; i++) {  
        variate().convert({ name: "a" })
      }

      expect(called).toBe(false)
    })
  })

  describe("remoteTest", () => {
    let variants = [ "aremote", "bremote" ]

    it("returns a random variant", done => {
      let variant = variate().remoteTest({ name: "remote" })
      variant
        .then(({ variant }) => {
          expect(variants.indexOf(variant) > -1).toBe(true)
          done()
        })
    })

    it("returns first variant if document undefined", done => {
      unloadDocument()

      let promise = Promise.resolve()

      for (let i=0; i<10; i++) {  
        promise = promise.then(() =>
          variate().remoteTest({ name: "remote" })
        ).then(({ variant }) =>
          expect(variants.indexOf(variant) > -1).toBe(true)
        )
      }

      promise.then(done)
    })

    it("writes to document.cookie", done => {
      let variant = variate().remoteTest({ name: "remote" })
        .then(() => {
          return variate().remoteConvert({ name: "remote" })
        }).then(({ variant }) => {
          expect(document.cookie).toEqual(
            `variate={%22remote%22:%22${variant}%22%2C%22c:remote%22:1}; path=/`
          )
          done()
        })
    })

    it("reads from document.cookie", done => {
      variate().remoteTest({ name: "remote" }).then(({ variant }) => {
        let promise = Promise.resolve()

        for (let i of Array(10).keys()) {
          promise = promise.then(() =>
            variate().remoteTest({ name: "remote" })
          ).then(args => {
            expect(variant).toEqual(args.variant)
          })
        }

        promise.then(done)
      })
    })

    it("calls a callback", done => {
      variate({
        remoteCallback: ({ name, promise: { resolve } }) => {
          expect(name).toBe("remote")
          resolve(variant_data)
        }
      })
      variate().remoteTest({ name: "remote" })
        .then(({ name, variant, data }) => {
          expect(name).toBe("remote")
          expect(variants.indexOf(variant) > -1).toBe(true)
          expect(data).toEqual({ test: "test" })
          done()
        })
    })

    it("doesn't call a callback twice", () => {
      let remoteCallback = jasmine.createSpy("callback")
        .and.callFake(({ promise: { resolve } }) => resolve(variant_data))
      variate({ remoteCallback })
      variate().remoteTest({ name: "remote" })
      expect(remoteCallback).toHaveBeenCalledTimes(1)
      variate().remoteTest({ name: "remote" })
      expect(remoteCallback).toHaveBeenCalledTimes(1)
    })
  })

  describe("remoteConvert", () => {
    let variants = [ "aremote", "bremote" ]

    it("calls a callback", done => {
      variate().remoteTest({ name: "remote" })
        .then(() =>
          variate().remoteConvert({ name: "remote" })
        )
        .then(({ name, variant, converted, data }) => {
          expect(name).toBe("remote")
          expect(variants.indexOf(variant) > -1).toBe(true)
          expect(converted).toBe(true)
          expect(data).toEqual({ test: "test" })
          done()
        })
    })

    it("calls a callback", done => {
      let remoteCallback = ({ name, converted, promise: { resolve } }) => {
        expect(name).toBe("remote")
        expect(converted).toBe(true)
        resolve(variant_data)
      }
      variate().remoteTest({ name: "remote" })
        .then(() => {
          variate({ remoteCallback })
          return variate().remoteConvert({ name: "remote" })
        })
        .then(({ name, converted, variant, data }) => {
          expect(name).toBe("remote")
          expect(variants.indexOf(variant) > -1).toBe(true)
          expect(converted).toBe(true)
          expect(data).toEqual({ test: "test" })
          done()
        })
    })

    it("doesn't call a callback twice", done => {
      let remoteCallback = jasmine.createSpy("callback")
      variate().remoteTest({ name: "remote" })
        .then(() => {
          variate({ remoteCallback })
          variate().remoteConvert({ name: "remote" })
          expect(remoteCallback).toHaveBeenCalledTimes(1)
          variate().remoteConvert({ name: "remote" })
          expect(remoteCallback).toHaveBeenCalledTimes(1)
          done()
        })
    })

    it("calls a callback twice if different action", done => {
      let remoteCallback = jasmine.createSpy("callback")
      variate().remoteTest({ name: "remote" })
        .then(() => {
          variate({ remoteCallback })
          variate().remoteConvert({ name: "remote", action: "open" })
          expect(remoteCallback).toHaveBeenCalledTimes(1)
          variate().remoteConvert({ name: "remote", action: "submit" })
          expect(remoteCallback).toHaveBeenCalledTimes(2)
          done()
        })
    })
  })
})
