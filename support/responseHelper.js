const fs = require('fs');
const path = require('path');
const { expect } = require('chai');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

async function storeResponse(world, response) {
  world.response = response;
  world.responseBodyText = await response.text();
  try {
    world.responseBodyJson = JSON.parse(world.responseBodyText);
  } catch (err) {
    world.responseBodyJson = null;
  }
}

function getJsonProperty(json, propertyPath) {
  return propertyPath.split('.').reduce((obj, segment) => {
    if (obj && Object.prototype.hasOwnProperty.call(obj, segment)) {
      return obj[segment];
    }
    return undefined;
  }, json);
}

function parseExpectedValue(value) {
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (/^-?\d+$/.test(value)) return parseInt(value, 10);
  if (/^-?\d*\.\d+$/.test(value)) return parseFloat(value);
  return value;
}

function assertPropertyEquals(world, propertyPath, expectedValue) {
  const json = world.responseBodyJson || (world.responseBodyText ? JSON.parse(world.responseBodyText) : {});
  const actual = getJsonProperty(json, propertyPath);
  const expected = parseExpectedValue(expectedValue);
  expect(actual).to.equal(expected);
}

function prettyPrintResponse(world) {
  if (world.responseBodyJson) {
    console.log(JSON.stringify(world.responseBodyJson, null, 2));
  } else if (world.responseBodyText) {
    console.log(world.responseBodyText);
  } else {
    console.log('<no response body>');
  }
}

function saveResponseToFile(world, outPath) {
  const target = path.resolve(process.cwd(), outPath);
  fs.writeFileSync(target, world.responseBodyText || '', 'utf-8');
}

function validateSchema(world, schemaFilePath) {
  const schemaPath = path.resolve(process.cwd(), schemaFilePath);
  if (!fs.existsSync(schemaPath)) {
    throw new Error(`Schema file not found: ${schemaPath}`);
  }
  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));
  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);
  const validate = ajv.compile(schema);
  const data = world.responseBodyJson || (world.responseBodyText ? JSON.parse(world.responseBodyText) : {});
  const valid = validate(data);
  if (!valid) {
    const errors = validate.errors.map(e => `${e.instancePath} ${e.message}`).join('; ');
    throw new Error(`Schema validation failed: ${errors}`);
  }
  return true;
}

module.exports = {
  storeResponse,
  getJsonProperty,
  parseExpectedValue,
  assertPropertyEquals,
  prettyPrintResponse,
  saveResponseToFile,
  validateSchema,
};
