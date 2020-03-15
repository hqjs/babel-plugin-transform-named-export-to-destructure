# https://hqjs.org
Transform named export to destructure.

# Installation
```sh
npm install hqjs@babel-plugin-transform-named-export-to-destructure
```

# Transformation
Plugin makes destructure export work with modules that only provide default export.
```js
import {x as y, h as l} from 'z';
console.log(y);
export {x as y} from 'z';
export {a} from 'zz';
console.log(a);
import {a, b} from 'zz';
export * as w from 'zzz';
```

will turn into
```js
import { x as y, h as l } from 'z';
console.log(y);
import 'z';
export const y = _ref;
import { a as _ref2 } from 'zz';
export const a = _ref2;
console.log(a);
import { b } from 'zz';
import * as _ref3 from 'zzz';
export const w = _ref3;
```
