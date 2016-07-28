import factory from "./factory"
import http from "axios"

class API {
  getVariant({ name, promise: { resolve }, state: { remote, session_id } }) {
    let params = { context: `name:${name}`, session_id }
    http.get(`${remote}/arm/draw`, { params })
      .then(response => resolve({ variant: response.data.data }))
  }

  postConversion({ name, reward="1.0", variant, promise: { resolve }, state: { remote } }) {
    let params = { arm: variant, context: `name:${name}`, reward }
    http.post(`${remote}/arm/track-reward`, params)
      .then(() => resolve())
  }
}

export default factory(API)
