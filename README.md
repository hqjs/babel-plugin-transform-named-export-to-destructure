# https://hqjs.org
Transform named export to destructure.

# Installation
```sh
npm install hqjs@babel-plugin-transform-named-export-to-destructure
```

# Transformation
Plugin makes destructure export work with modules that only provide default export.
```js
export {x as y} from 'z';
export {a} from 'zz';
export * as w from 'zzz';
export * from 'zzzz';
```

will turn into
```js
import { x as _ref } from 'z';
export const y = _ref;
import { a as _ref2 } from 'zz';
export const a = _ref2;
import * as _ref3 from 'zzz';
export const w = _ref3;
export * from 'zzzz';
```
