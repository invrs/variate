import variate from "../../"

function loadDocument() {
  global.document = { cookie: undefined }
}

function unloadDocument() {
  delete global.document
}

let test  = [ "b", "c" ]
let tests = { a: test }

describe("Variate", () => {
  beforeEach(() => {
    loadDocument()
  })

  afterEach(() => {
    unloadDocument()
  })

  describe("randomVariant", () => {
    it("returns a random variant from a test array", () => {
      let { variant } = variate().randomVariant({ test })
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
      
      expect(variate()._include.cookie().state())
        .toEqual({ cookie })
    })
  })

  describe("test", () => {
    it("returns a random variant", () => {
      variate({ tests })
      let variant = variate().test({ name: "a" })

      expect(test.indexOf(variant.value) > -1).toBe(true)
    })

    it("returns first variant if document undefined", () => {
      variate({ tests })
      unloadDocument()

      for (let i=0; i<10; i++) {  
        let variant = variate().test({ name: "a" })
        expect(variant.value).toBe("b")
      }
    })

    it("writes to document.cookie", () => {
      variate({ tests })
      let variant = variate().test({ name: "a" }).value

      expect(document.cookie).toEqual(`a=${variant}; path=/`)
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
      variate({ tests, callback  })
      variate().test({ name: "a" })
    })

    it("doesn't call the callback again", () => {
      let called = false
      let callback = () => called = true
      
      variate({ tests, callback, cache: {}  })
      variate().test({ name: "a" })
      expect(called).toBe(true)

      called = false
      variate().test({ name: "a" })
      expect(called).toBe(false)
    })
  })

  describe("convert", () => {
    it("calls a callback", (done) => {
      let callback = ({ name, test, variant, converted }) => {
        expect(name).toBe("a")
        expect(test).toEqual(test)
        expect(test.indexOf(variant) > -1).toBe(true)
        expect(converted).toEqual(true)
        done()
      }
      variate({ tests, cache: {}  })
      variate().test({ name: "a" })
      variate({ callback  })
      variate().convert({ name: "a" })
    })

    it("doesn't call the callback again", () => {
      let called = false
      let callback = () => called = true
      
      variate({ tests, callback  })
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

      variate({ tests })
      variate().test({ name: "a" })
      unloadDocument()
      variate({ callback })

      for (let i=0; i<100; i++) {  
        variate().convert({ name: "a" })
      }

      expect(called).toBe(false)
    })
  })
})
