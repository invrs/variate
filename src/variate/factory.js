import { factory } from "industry"
import { include } from "industry-include"
import { instance } from "industry-instance"
import { functions } from "industry-functions"
import { standard_io } from "industry-standard-io"
import { state } from "industry-state"

let browserify = () => {
  require("./callback_store")
  require("./cookie")
}

export default factory()
  .set("init", Class =>
    class extends Class {
      constructor(...args) {
        super(...args)

        this.standardIO()
        this.include(__dirname, {
          files: {
            dirs: {},
            files: [
              `${__dirname}/callback_store.js`,
              `${__dirname}/cookie.js`
            ],
            values: [
              require("./callback_store").default,
              require("./cookie").default
            ]
          }
        })
        this.stateful()
        
        if (super.init) {
          super.init(...args)
        }
      }
    }
  )
  .set("functions", functions)
  .set("include", include)
  .set("instance", instance)
  .set("standard_io", standard_io)
  .set("state", state)
