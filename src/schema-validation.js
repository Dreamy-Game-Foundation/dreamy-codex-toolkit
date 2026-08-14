import fs from "node:fs";
import path from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

export function createSchemaValidator(schemaRoot) {
  const ajv = new Ajv2020({ allErrors: true, strict: true, allowUnionTypes: true });
  addFormats(ajv);
  const files = fs.readdirSync(schemaRoot).filter((name) => name.endsWith(".schema.json"));
  for (const file of files) ajv.addSchema(JSON.parse(fs.readFileSync(path.join(schemaRoot, file), "utf8")));
  return ajv;
}

export function validateWithSchema(ajv, schemaId, value, label) {
  const validate = ajv.getSchema(schemaId);
  if (!validate) throw new Error(`Schema is not registered: ${schemaId}`);
  if (validate(value)) return;
  const details = validate.errors.map((error) => `${error.instancePath || "/"} ${error.message}`).join("; ");
  throw new Error(`${label} does not match ${schemaId}: ${details}`);
}
