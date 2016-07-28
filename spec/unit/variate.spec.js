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

describe("Variate", () => {
  beforeEach(() => {
    loadDocument()
    variate({ tests }).cookie().cache = {}
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
      
      expect(variate().cookie().state())
        .toEqual({ cookie, tests: { a: [ 'b', 'c' ] } })
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

    it("calls a callback", (done) => {
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
    it("calls a callback", (done) => {
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

    beforeEach(() => {
      variate({ remote: "http://127.0.0.1:4009", session_id: "test" })
    })

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
      let variant
      let remoteCallback = ({ name, variant }) => {
        expect(name).toBe("remote")
        expect(variants.indexOf(variant) > -1).toBe(true)
        done()
      }
      variate({ remoteCallback  })
      variate().remoteTest({ name: "remote" })
    })

    it("doesn't call the callback again", done => {
      let shared = {}
      let remoteCallback = () => shared.called = true
      
      variate({ remoteCallback }).cookie().cache = {}
      variate().remoteTest({ name: "remote" })
        .then(() => {
          expect(shared.called).toBe(true)
          shared.called = false
        })
        .then(() =>
          variate().remoteTest({ name: "remote" })
        )
        .then(() => {
          expect(shared.called).toBe(false)
          done()
        })
    })
  })

  describe("remoteConvert", () => {
    let variants = [ "aremote", "bremote" ]

    beforeEach(() => {
      variate({ remote: "http://127.0.0.1:4009", session_id: "test" })
    })

    it("calls a callback", done => {
      let variant
      let remoteCallback = ({ name, variant, converted }) => {
        expect(name).toBe("remote")
        expect(variants.indexOf(variant) > -1).toBe(true)
        expect(converted).toBe(true)
      }
      variate().remoteTest({ name: "remote" })
        .then(() => {
          variate({ remoteCallback  })
          return variate().remoteConvert({ name: "remote", random: true })
        })
        .then(() => done())
    })

    it("doesn't call the callback again", done => {
      let shared = { called: false }
      let remoteCallback = () => shared.called = true
      
      variate({ remoteCallback: false }).cookie().cache = {}
      variate().remoteTest({ name: "remote" })
        .then(() => {
          expect(shared.called).toBe(false)
          variate({ remoteCallback })
          return variate().remoteConvert({ name: "remote" })
        })
        .then(() => {
          expect(shared.called).toBe(true)
          shared.called = false
        })
        .then(() =>
          variate().remoteConvert({ name: "remote" })
        )
        .then(() => {
          expect(shared.called).toBe(false)
          done()
        })
    })

    it("does nothing if document undefined", done => {
      let called = false
      let remoteCallback = () => called = true

      unloadDocument()
      variate({ remoteCallback })

      let promise = variate().remoteTest({ name: "remote" })

      for (let i of Array(10).keys()) {
        promise = promise.then(() =>
          variate().remoteConvert({ name: "remote" })
        )
      }

      promise.then(() => {
        expect(called).toBe(false)
        done()
      })
    })
  })
})
