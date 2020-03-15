# https://hqjs.org
Transform named export to destructure.

# Installation
```sh
npm install hqjs@babel-plugin-transform-named-export-to-destructure
```

# Transformation
Plugin makes destructure export work with modules that only provide default export.
```js
import css from '@emotion/css';
console.log(css);
export { default as css } from '@emotion/css';
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
import { css as _ref } from '@emotion/css';
export const css = _ref;
console.log(css);
import { y as _ref2, h as l } from 'z';
export const y = _ref2;
console.log(y);
import { a as _ref3 } from 'zz';
export const a = _ref3;
console.log(a);
import { b } from 'zz';
import * as _ref4 from 'zzz';
export const w = _ref4;
```
