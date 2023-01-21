# runtypes-pretty-validation

validate [runtypes](https://github.com/pelotom/runtypes) schemas against a value, and reflect back a pretty validation report, matching the schema.
Prettyifies structural error messages arbitrarily deep.

```ts
import { validate } from "runtypes-pretty-validation";
const schema = rt.Record({ foo: rt.Literal("bar") });
validate(schema, null); // Expected object, got "null"
validate(schema, { bar: "bar" }); // { foo: 'Expected literal `bar`, but was `undefined`' }
validate(schema, { foo: "bar" }); // undefined, all valid
```

[![main](https://github.com/cdaringe/runtypes-pretty-validation/actions/workflows/main.yml/badge.svg)](https://github.com/cdaringe/runtypes-pretty-validation/actions/workflows/main.yml)

## install

`npm install runtypes-pretty-validation`

## examples

see [test.ts](./test.ts) for more.
