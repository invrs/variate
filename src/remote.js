import factory from "./factory"
import http from "axios"

class API {
  pattern() {
    let test = () => process.env.ENV == "test"
    let notTest = () => !test()
    return {
      httpGetRemote:  notTest,
      httpGetTest:    test,
      httpPostRemote: notTest,
      httpPostTest:   test
    }
  }

  getVariant() {
    return [
      this.getVariantParams,
      this.httpGet
    ]
  }

    getVariantParams({ name, state: { remote, session_id } }) {
      return {
        params: { context: `name:${name}`, session_id },
        url: `${remote.base}${remote.test_path}`,
        responder: response => {
          let data = response.data.data
          return { variant: data.name, data: data.value }
        },
        testResponder: () => {
          return { variant: "aremote", data: { test: "test" } }
        }
      }
    }

  httpGet() {
    return [
      this.httpGetRemote,
      this.httpGetTest
    ]
  }

    httpGetRemote({ params, responder, url, promise: { resolve } }) {
      http.get(url, { params })
        .then(response => resolve(responder(response)))
    }

    httpGetTest({ testResponder, promise: { resolve } }) {
      resolve(testResponder())
    }

  httpPost() {
    return [
      this.httpPostRemote,
      this.httpPostTest
    ]
  }

    httpPostRemote({ params, responder, url, promise: { resolve } }) {
      http.post(url, params)
        .then(response => resolve(responder(response)))
    }

    httpPostTest({ testResponder, promise: { resolve } }) {
      resolve(testResponder())
    }

  postConversion() {
    return [
      this.postConversionParams,
      this.httpPost
    ]
  }

    postConversionParams({ name, reward="1.0", variant, state: { remote } }) {
      return {
        params: { arm: variant, context: `name:${name}`, reward },
        url: `${remote.base}${remote.convert_path}`,
        responder: response => { return {} },
        testResponder: () => { return {} }
      }
    }
}

export default factory(API)
