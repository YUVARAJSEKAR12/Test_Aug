const fs = require('fs');
const path = require('path');
require('dotenv').config();
const responseHelper = require('../support/responseHelper');
const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('chai');

Given('the API base URL is loaded from env', async function () {
  const baseUrl = process.env.API_BASE_URL;
  if (!baseUrl) {
    throw new Error('API_BASE_URL is not defined in .env');
  }
  this.apiClient = new (require('../support/apiClient').ApiClient)(baseUrl);
  await this.apiClient.init();
});

When('I GET {string}', async function (path) {
  const response = await this.apiClient.get(path);
  await responseHelper.storeResponse(this, response);
  console.log('\nAPI response status:', this.response.status());
  responseHelper.prettyPrintResponse(this);
});

When('I POST {string} with body:', async function (path, body) {
  const payload = JSON.parse(body);
  const response = await this.apiClient.post(path, payload);
  await responseHelper.storeResponse(this, response);
  console.log('\nAPI response status:', this.response.status());
  responseHelper.prettyPrintResponse(this);
});

When('I POST {string} with payload file {string}', async function (requestPath, payloadFile) {
  const filePath = path.resolve(process.cwd(), payloadFile);
  const fileContents = fs.readFileSync(filePath, 'utf-8');
  const payload = JSON.parse(fileContents);
  const response = await this.apiClient.post(requestPath, payload);
  await responseHelper.storeResponse(this, response);
  console.log('\nAPI response status:', this.response.status());
  responseHelper.prettyPrintResponse(this);
});

Then('the response status should be {int}', async function (status) {
  expect(this.response.status()).to.equal(status);
});

Then('the JSON response should have property {string} with value {string}', async function (property, value) {
  responseHelper.assertPropertyEquals(this, property, value);
});

Then('print the response body', function () {
  responseHelper.prettyPrintResponse(this);
});

Then('save the response body to file {string}', function (outPath) {
  responseHelper.saveResponseToFile(this, outPath);
});

Then('the response should match schema {string}', function (schemaPath) {
  responseHelper.validateSchema(this, schemaPath);
});
