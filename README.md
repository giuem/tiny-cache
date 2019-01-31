# TinyCache

[![travis](https://flat.badgen.net/travis/giuem/tiny-cache)](https://travis-ci.com/giuem/tiny-cache)
[![codecov](https://flat.badgen.net/codecov/c/github/giuem/tiny-cache)](https://codecov.io/gh/giuem/tiny-cache)
[![size](https://flat.badgen.net/bundlephobia/minzip/@giuem/tiny-cache)](https://bundlephobia.com/result?p=@giuem/tiny-cache)
[![npm version](https://flat.badgen.net/npm/v/@giuem/tiny-cache)](https://www.npmjs.com/package/@giuem/tiny-cache)
[![npm license](https://flat.badgen.net/npm/license/@giuem/tiny-cache)](https://github.com/giuem/tiny-cache/blob/master/LICENSE)

A tiny library (**< 1kb Gzipped, < 2kb Minified**) that storage your JavaScript files in localStorage.

**:heavy_exclamation_mark:DO NOT USE IT IN PRODUCTION.** This library is under development, its API and implementation may be changed at any time.

## Installation

Via NPM,

``` bash
npm install @giuem/tiny-cahce
# or with yarn
yarn add @giuem/tiny-cahce
```

Or insert script directly,

``` html
<script src="https://cdn.jsdelivr.net/npm/@giuem/tiny-cache/dist/tiny-cache.min.js"></script>
```

## Usage

For Node.js, import it first,

```javascript
import { TinyCache } from "@giuem/tiny-cache";
```

Then, initialize a TinyCache instance:

```javascript
const tc = new TinyCache();
```

Now you can load your JavaScript files,

```javascript
tc.load([
    { name: "script-1", url: "./script-1.js" },
    { name: "script-2", url: "./script-2.js", maxAge: 86400 },
    // more files ...
]);
```

## API

### TinyCache.constructor(config?: object)

The `constructor` accepts an optional config with the following parameters:

* `prefix`: localStorage key prefix. Defaults to `TC:`.
* `timeout`: timeout for xhr request. Defaults to `6000` (6 seconds).

### TinyCache.load(scripts: object[], callback?: (err: Error | null) => void): Promise\<void\>

The `load` method loads a set of scripts, every script object has the following properties:

* `name`: unique name for the script.
* `url`: the URI of the script. Also identity the script's content, script will be updated if changed. Because of the CORS restrictions, loading a script without CORS header will fallback to script tag mode and won't be cached.
* `maxAge`: maxAge for the script, specify how long before the script is expired(in seconds). If not provided, script will never be expired.

It supports both callback and promise style. For example,

```javascript
tc.load([...], function(err) {
    if (err) {
        return;
    }
});
// or
tc.load([...]).then(() => {

}).catch(err => {
    console.error(err);
});
```

### TinyCache.remove(script: object)

Remove localStorage item. The script object is the same as `load` method's.

## License

MIT