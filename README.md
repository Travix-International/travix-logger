# travix-logger

[![npm](https://img.shields.io/npm/v/travix-logger.svg)](https://www.npmjs.com/package/travix-logger) [![Build Status](https://img.shields.io/travis/Travix-International/travix-logger/master.svg)](http://travis-ci.org/Travix-International/travix-logger) [![Coverage](https://img.shields.io/coveralls/Travix-International/travix-logger.svg)](https://coveralls.io/github/Travix-International/travix-logger)

> Logger library for the browser and node.js

* [Installation](#installation)
* [Usage](#usage)
* [Guide](#guide)
  * [Levels](#levels)
  * [Transports](#transports)
  * [Formatters](#formatters)
* [API](#api)
  * [`Logger`](#logger)
  * [`createTransport`](#createtransport)
* [Built-in transports](#built-in-transports)
  * [Console](#console)
  * [Http](#http)

## Installation

Install it via [npm](https://npmjs.com):

```
$ npm install --save travix-logger
```

## Usage

Example usage in ES6 (in node.js and webpack/browserify bundles):

```js
import { Logger, configureConsoleTransport } from 'travix-logger';

const logger = new Logger({
  transports: [
    configureConsoleTransport()
  ]
});

logger.log('Error', 'EventName', 'Some error occurred', { meta: 'values' });

// same as
logger.error('EventName', 'Some error occurred', { meta: 'values' });
```

In the browser:

```html
<script src="https://unpkg.com/travix-logger@latest/dist/travix-logger.min.js"></script>

<script>
  // now available as `window.TravixLogger`
</script>
```

---

# Guide

## Levels

Levels are type of logs that you can capture with `travix-logger`. If you have a `warn` level, it will be made accessible to you from the `Logger` instance as `logger.warn(event, message, meta)` for example.

By default, these levels are used:

### `debug`

> debug(event, message, meta)

Level name: `Debug`.

### `info`

> info(event, message, meta)

Level name: `Info`.

### `warn`

> warn(event, message, meta)

Level name: `Warning`.

### `error`

> error(event, message, meta)

Level name: `Error`.

### `exception`

> exception(event, errorObject, message, meta)

Level name: `Error`.

### Custom levels

You can override the levels data, at `Logger` instance level as follows:

```js
import { Logger } from 'travix-logger';

const logger = new Logger({
  levels: {
    // key is the method name
    error: {
      name: 'Error' // the level name passed to formatters and transports
    },
    warn: {
      // if `methodName` is not present, it will default to the key `warn`
    },
    exception: {
      error: true // method then accepts `(event, errorObject, message, meta)`
    }
  }
});
```

## Transports

Transports are responsible for storing the logs. Each instance of `Logger` can have multiple transports. For example, one Transport can be responsible for printing out the logs in console, while the other can sent it to a remote server.

This library already ships with a `ConsoleTransport` by default, which can be used right away:

```js
import { Logger, configureConsoleTransport } from 'travix-logger';

const logger = new Logger({
  transports: [
    configureConsoleTransport()
  ]
});
```

Whenever you call `logger.log()` for example, the `ConsoleTransport` would take up the responsibility of printing out the log to console every time.

### Custom transport

Creating custom transports is very easy, and the library already comes with the necesasry utilities for you:

```js
// ./transports/MyCustomTransport.js

import { createTransport } from 'travix-logger';

export default createTransport({
  initialize() {
    // you have access to Logger instance as `this.logger`.
  },

  log(level, event, message, meta, cb) {
    // do something with the data
    console.log(level, event, message, meta);

    // trigger the callback, when successful
    cb(null);

    // if any error while processing the log
    cb(new Error('Something went wrong while processing the log'));
  }
});
```

Now you can pass it as a Transport while instantiating a new Logger instance:

```js
import { Logger } from 'travix-logger';
import MyCustomTransport from './transports/MyCustomTransport';

const logger = new Logger({
  transports: [
    MyCustomTransport
  ]
});
```

## Formatters

Formatters can intercept your log data, and modify them before they are sent to Transports.

### Custom formatter

They are just plain synchronous functions, which accept the same arguments as `Logger.log()`, and returns the modified values.

```js
import { Logger } from 'travix-logger';

function myCustomFormatter(level, event, message, meta) {
  meta.addedNewKey = 'some value';

  if (meta.creditCardNumber) {
    meta.creditCardNumber = mask(meta.creditCardNumber);
  }

  message += ' [appended message]';

  return {
    level,
    event,
    message,
    meta
  };
}

const logger = new Logger({
  formatters: [
    myCustomFormatter
  ]
});
```

---

# API

## Logger

### Constructor options

#### `levels`

(optional) Levels object, where level name is the `key`.

#### `transports`

Array of Transport classes.

#### `formatters`

Array of Formatter functions.

#### `defaultMeta`

(optional) Default `meta` object that logs' meta will extend from.

#### `timestamp`

Defaults to `false`. When `true`, it will add a new Date object to the `timestamp` key in `meta` object for every new logs.

If you want the timestamp in `meta` with a different key, you can pass a string instead.

#### `errorMessageKey`

For mapping `Error.message` value in `meta`, when logging exceptions. Defaults to `exceptionmessage`.

#### `errorStackKey`

For mapping `Error.stack` value in `meta`, when logging exceptions. Defaults to `exceptiondetails`.

### Properties

#### `options`

Options passed during construction.

### Methods

In addition to the methods listed below, `Logger` instances will also have methods according to the `levels`.

#### `log`

> `log(level, event, message, meta = {}, logCallback = null)`

## createTransport

> createTransport(options = {})

### Options

#### `initialize`

> initialize()

Called when the Tranport class is constructed.

#### `log`

> log(level, event, message, meta, cb)

This method must be implemented when creating a new Transport.

If there is any issue while processing the log, call `cb(new Error('something went wrong'))`.

Otherwise, call `cb(null)`;

#### `name`

Custom name for the Transport class, defaults to `Transport`.

### Properties

#### logger

Reference to the parent `Logger` instance.

## each

> each(arr, iterator, cb)

Utility function for processing an array asynchronously.

### Arguments

1. `arr` (`Array`): Array to iterate
1. `iterator` (`Function`): Accepting these arguments:
    1. `item`: The iterated item from the array
    1. `cb` (`Function`): Call `cb(null)` when processed successfully, otherwise call `cb(err)`.
1. `cb` (`Function`): Called with `null` when all items processed successfully, otherwise with `err`.

---

# Built-in transports

## Console

A configureable `ConsoleTransport` is shipped with the package:

```js
import { Logger, configureConsoleTransport } from 'travix-logger';

const logger = new Logger({
  transports: [
    configureConsoleTransport({
      // you can optionally override the `console` function
      console: myAwesomeConsoleObject
    })
  ]
});
```

### Options

#### `console`

Unless any function is provided here, it will default to the global scope's `console` object. Like `window.console` in the browser.

#### `filter`

Optional function that filters the logs from being processed. Defaults to returning `true` for all logs.

Example:

```js
function filter(level, event, message, meta) {
  return true;
}
```

#### `format`

Optional function that can customize log string in a console.

Example:

```js
function format(level, event, message, meta) {
  return `${level} - ${message}`;
}
```

#### `name`

Defaults to `ConsoleTransport`.

## Http

Transport for sending log data to a remote location:

```js
import { Logger, configureHttpTransport } from 'travix-logger';

const logger = new Logger({
  transports: [
    configureHttpTransport({
      // required
      url: 'https://logs.example.com/submit',

      // optional
      method: 'POST',
      formatBody(level, event, message, meta) {
        return JSON.stringify({
          level,
          message,
          ...meta
        });
      }
    })
  ]
})
```

### Options

#### `url`

URL to send the log data to.

#### `filter`

Optional function that filters the logs from being processed. Defaults to returning `true` for all logs.

Example:

```js
function filter(level, event, message, meta) {
  return true;
}
```

#### `method`

One of the HTTP methods, defaults to `POST`.

`GET` and `HEAD` are not allowed, since they do not support `body`.

#### `name`

Defaults to `HttpTransport`.

#### `eventKey`

For mapping the `event` name in the body. Defaults to `messagetype`.

#### `formatBody`

A function accepting `(level, message, meta)`, and returning a string to be used as `body` value.

#### `headers`

Follows fetch API. Currently defaults to:

```
{
  'Accept': 'application/json',
  'Content-Type': 'application/json'
}
```

#### Other fetch API options

Supports:

* `credentials`
* `mode`
* `cache`
* `redirect`
* `referrer`
* `referrerPolicy`
* `integrity`

See [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/GlobalFetch/fetch) documentation.

---

## Release

To release a new version:

```
$ make release VERSION=patch
```

`VERSION` value can be `patch`, `minor`, or `major` following [semver](http://semver.org/).

## License

MIT © [Travix International](http://travix.com)
