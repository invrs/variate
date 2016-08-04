import { factory } from "industry"
import { chain } from "industry-chain"
import { exception } from "industry-exception"
import { include } from "industry-include"
import { instance } from "industry-instance"
import { functions } from "industry-functions"
import { pattern } from "industry-pattern"
import { standard_io } from "industry-standard-io"
import { state } from "industry-state"

export default factory()
  .set("exception", exception)
  .set("include", include)
  .set("instance", instance)
  .set("functions", functions)
  .set("pattern", pattern)
  .set("state", state)
  .set("standard_io", standard_io)
  .set("chain", chain)
  .set("init", Class =>
    class extends Class {
      init(...args) {
        this.include(__dirname, {
          files: {
            dirs: {},
            files: [
              `${__dirname}/cookie.js`,
              `${__dirname}/remote.js`
            ],
            values: [
              require("./cookie").default
              require("./remote").default
            ]
          }
        })
        super.init(...args)
      }
    }
  )
