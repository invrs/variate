import { factory } from "industry"
import { include } from "industry-include"
import { instance } from "industry-instance"
import { functions } from "industry-functions"
import { standard_io } from "industry-standard-io"
import { state } from "industry-state"

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
              `${__dirname}/cookie.js`
            ],
            values: [
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
