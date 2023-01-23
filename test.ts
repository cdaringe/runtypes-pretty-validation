import test from "ava";
import * as rt from "runtypes";
import { validate } from "./index";

test("basic", (t) => {
  const fooSchema = rt.Literal("foo");
  t.regex(validate(fooSchema, "bar") as string, /expected.*foo.*bar/i);
  t.is(validate(fooSchema, "foo"), undefined);

  const recordSchema = rt.Record({
    foo: fooSchema,
    bar: rt.Number,
    baz: rt.Record({
      qux: rt.Number.withConstraint((x) => (x <= 0 ? "qux must be > 0" : true)),
      mux: rt.Literal("mux"),
    }),
  });
  t.regex(validate(recordSchema, null) as string, /expected.*object.*null/i);
  const recordResult1 = validate(recordSchema, {
    foo: "BADFOO",
    bar: "NOTANUMBER",
    baz: { qux: -1, mux: "mux" },
  });
  t.like(recordResult1, {
    foo: "Expected literal `foo`, but was `BADFOO`",
    bar: "Expected number, but was string",
    baz: {
      qux: "Failed constraint check for number: qux must be > 0",
    },
  });
});

test("useFirstUnionSchemaOnFail", (t) => {
  const schema = rt.Union(
    rt.Record({ foo: rt.String }),
    rt.Record({ bar: rt.Number })
  );
  const result = validate(
    schema,
    { baz: 1 },
    { useFirstUnionSchemaOnFail: true }
  );
  console.log(JSON.stringify(result));
  t.like(result, { foo: "Expected string, but was undefined" });
});
