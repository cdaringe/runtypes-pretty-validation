/* eslint-disable complexity, @typescript-eslint/no-explicit-any */
import * as rt from "runtypes";

const nevAssert = (_: never, msg: string) => {
  throw new Error(msg);
};

const isPojo = (x: unknown): x is object =>
  x !== null &&
  typeof x === "object" &&
  Number.isInteger(Object.keys(x).length);

const childValue = (parent: unknown, key: string | number) =>
  parent == null ? undefined : (parent as any)[key];

type IndexedStructuralValidationResult = {
  index: number;
  result: StructuralValidationResult;
};
type StructuralValidationResult =
  | string
  | undefined
  | IndexedStructuralValidationResult[]
  | { [key: string]: StructuralValidationResult };

export function validate<S extends rt.Runtype>(
  schema: S,
  value: unknown,
  opts: {
    useFirstUnionSchemaOnFail?: boolean;
    useHighestKeyMatchRecordFailure?: boolean;
  } = {
    useFirstUnionSchemaOnFail: false,
    useHighestKeyMatchRecordFailure: false,
  }
): StructuralValidationResult {
  const r = schema.reflect;
  switch (r.tag) {
    case "dictionary": {
      if (isPojo(value)) {
        return Object.entries(value).reduce((acc, [k, v]) => {
          const child = validate(r.value, v, opts);
          return child === undefined ? acc : { ...acc, [k]: child };
        }, {});
      } else {
        return `Expected object, got ${value === null ? "null" : typeof value}`;
      }
    }
    case "record": {
      if (isPojo(value)) {
        return Object.entries(r.fields).reduce((acc, [k, v]) => {
          const child = validate(v, childValue(value, k), opts);
          return child === undefined ? acc : { ...(acc || {}), [k]: child };
        }, undefined as undefined | { [key: string]: StructuralValidationResult });
      } else {
        return `Expected object, got "${
          value === null ? "null" : typeof value
        }"`;
      }
    }
    case "union": {
      const firstSchema = r.alternatives[0];
      const highestMatchRecordFailure: {
        numKeysMatch: number;
        result: StructuralValidationResult;
      } = {
        numKeysMatch: 0,
        result: undefined,
      };
      const isValid = r.alternatives.some((subschema) => {
        const result = validate(subschema, value, opts);
        const isOk = result === undefined;
        // discern highest matching record failure
        if (!isOk && subschema.reflect.tag === "record") {
          const fieldNames = new Set(Object.keys(subschema.reflect.fields));
          const numKeysMatched = isPojo(value)
            ? Object.keys(value).reduce(
                (acc, key) => acc + (fieldNames.has(key) ? 1 : 0),
                0
              )
            : 0;
          if (numKeysMatched > highestMatchRecordFailure.numKeysMatch) {
            highestMatchRecordFailure.numKeysMatch = numKeysMatched;
            highestMatchRecordFailure.result = result;
          }
        }
        return isOk;
      });
      return isValid
        ? undefined
        : opts.useHighestKeyMatchRecordFailure &&
          highestMatchRecordFailure?.result
        ? highestMatchRecordFailure?.result
        : opts?.useFirstUnionSchemaOnFail && firstSchema
        ? validate(firstSchema, value, opts)
        : `No alternative schemas in the union matched "${typeof value}"`;
    }
    case "tuple": {
      const results = r.components
        .map((subschema, i) => {
          const result = validate(subschema, childValue(value, i), opts);
          return result
            ? undefined
            : {
                index: i,
                result,
              };
        })
        .filter(Boolean) as IndexedStructuralValidationResult[];
      return results.length ? undefined : results;
    }
    case "array":
    case "bigint":
    case "boolean":
    case "brand":
    case "constraint":
    case "function":
    case "instanceof":
    case "literal":
    case "never":
    case "number":
    case "optional":
    case "string":
    case "symbol":
    case "template":
    case "void":
    case "unknown": {
      try {
        r.check(value);
        return undefined;
      } catch (err) {
        return err instanceof Error ? err.message : "invalid data";
      }
    }
    case "intersect": {
      throw new Error("unsupported");
    }
    default: {
      nevAssert(r, `unhandled ${r}`);
    }
  }
  throw new Error("unhandled");
}
