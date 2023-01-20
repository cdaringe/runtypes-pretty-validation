# runtypes-pretty-validation

validate [runtypes](https://github.com/pelotom/runtypes) schemas against a value, and reflect back a validation report matching the schema.

```ts
const schema = rt.Record({ foo: rt.Literal("bar") });
t(schema, null); // Expected object, got "null"
t(schema, { bar: "bar" }); // { foo: 'Expected literal `bar`, but was `undefined`' }
t(schema, { foo: "bar" }); // undefined, all valid
```

[![main](https://github.com/cdaringe/runtypes-pretty-validation/actions/workflows/main.yml/badge.svg)](https://github.com/cdaringe/runtypes-pretty-validation/actions/workflows/main.yml)

## install

`npm install runtypes-pretty-validation`

## usage

```ts
import { tojsonschema } from "runtypes-pretty-validation";
import * as rt from "runtypes";

const myRtSchema = rt.Record({ foo: rt.Literal("bar") });
const myjsonschema = tojsonschema(myRtSchema);
// { type: "object", properties: { foo: { const: "bar" } } }
```

see [test.ts](./test.ts) for more.
