# Variate [![Build Status](https://travis-ci.org/invrs/variate.svg?branch=master)](https://travis-ci.org/invrs/variate)

Client-side multivariate testing.

## Install

```bash
npm install variate
```

## Usage

Variate uses the [industry factory pattern](https://github.com/invrs/industry):

```js
import variate from "variate"

variate({
  cookie: {
    expires: 10 * 365,
    path:    "/",
    domain:  "site.com",
    secure:  true
  },
  tests: {
    banner: [ "short", "tall" ]
  },
  callback: ({ name, test, variant, converted }) => {
    // name - "banner"
    // test - [ "short", "tall" ]
    // variant - "short" or "tall"
    // converted - true or false
  }
})

// returns "short" or "tall"
//
variate().test({ name: "banner" })

// record conversion
//
variate().convert({ name: "banner" })
```
