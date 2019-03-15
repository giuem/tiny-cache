# TinyCache

[![travis](https://img.shields.io/travis/com/giuem/tiny-cache.svg?style=flat-square)](https://travis-ci.com/giuem/tiny-cache)
[![codecov](https://img.shields.io/codecov/c/github/giuem/tiny-cache.svg?style=flat-square)](https://codecov.io/gh/giuem/tiny-cache)
[![size](https://img.badgesize.io/https://cdn.jsdelivr.net/npm/@giuem/tiny-cache@latest/dist/tiny-cache.min.js?compression=gzip&style=flat-square)](https://cdn.jsdelivr.net/npm/@giuem/tiny-cache@latest/dist/tiny-cache.min.js)
[![npm version](https://img.shields.io/npm/v/@giuem/tiny-cache.svg?style=flat-square)](https://www.npmjs.com/package/@giuem/tiny-cache)
[![npm license](https://img.shields.io/npm/l/@giuem/tiny-cache.svg?style=flat-square)](https://github.com/giuem/tiny-cache/blob/master/LICENSE)

A tiny library (**\~ 1kb Gzipped**) that cache your JavaScript files in localStorage.

**:heavy_exclamation_mark:DO NOT USE IT IN PRODUCTION.** This library is under development, its API and implementation may be changed at any time.

## Installation

Via NPM or Yarn,

``` bash
npm install @giuem/tiny-cahce
# or with yarn
yarn add @giuem/tiny-cahce
```

Or insert script directly,

``` html
<script src="https://cdn.jsdelivr.net/npm/@giuem/tiny-cache/dist/tiny-cache.min.js"></script>
<script>
TinyCache.load(/* ... */);
</script>
```

## Usage

For Node.js or modern frontend, require/import it first,

```javascript
// CommonJS
const { load } = require("@giuem/tiny-cache");
// ES Module
import { load } from "@giuem/tiny-cache";
```

Now you can load your JavaScript files,

```javascript
load([
    { name: "script-1", url: "./script-1.js" },
    { name: "script-2", url: "./script-2.js", maxAge: 86400 },
    // more files ...
]);
```

## API

### TinyCache.configure(config: object)

Configure TinyCache, the `config` accepts an optional config with the following parameters:

* `prefix`: localStorage key prefix. Defaults to `TC:`.
* `timeout`: timeout for xhr request. Defaults to `6000` (6 seconds).

### TinyCache.load(resources: [], callback?): Promise\<void\>

The `load` method loads a set of resources, every resource object has the following properties:

* `name`: unique name for the script.
* `url`: the URI of the script. Also identity the script's content, script will be updated if changed. Because of the CORS restrictions, loading a script without CORS header will fallback to `<script>` tag and won't be cached in localStorage.
* `maxAge`: maxAge for the script. Specify how long before the script is expired (in seconds). If not provided, script will never be expired.

This method supports both callback and promise style. For example,

```javascript
TinyCache.load([...], function(err) {
    if (err) {
        console.error(err);
        return;
    }
    // scripts loaded
});
// or
TinyCache.load([...]).then(() => {
    // scripts loaded
}).catch(err => {
    console.error(err);
});
```

### TinyCache.remove(resource: object)

Remove localStorage item. The script object is the same as `load` method's.

## License

MIT
