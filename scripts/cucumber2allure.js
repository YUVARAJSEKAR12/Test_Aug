const fs = require('fs');
const path = require('path');
const { AllureRuntime, Status, LabelName } = require('allure2-js-commons');

function cucumberStatusToAllure(status) {
  switch (status) {
    case 'passed':
      return Status.PASSED;
    case 'failed':
      return Status.FAILED;
    case 'skipped':
      return Status.SKIPPED;
    case 'undefined':
      return Status.BROKEN;
    default:
      return Status.BROKEN;
  }
}

function ensureResultsDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function main() {
  const cucumberJsonPath = path.resolve(process.cwd(), 'cucumber.json');
  if (!fs.existsSync(cucumberJsonPath)) {
    console.error('cucumber.json not found. Run cucumber-js first with json formatter.');
    process.exit(1);
  }

  const jsonText = fs.readFileSync(cucumberJsonPath, 'utf-8');
  const features = JSON.parse(jsonText);
  const resultsDir = path.resolve(process.cwd(), 'allure-results');
  ensureResultsDir(resultsDir);

  const runtime = new AllureRuntime({ resultsDir });

  // ensure directory exists before writing any results
  ensureResultsDir(resultsDir);

  for (const feature of features) {
    const group = runtime.startGroup(feature.name || feature.uri || 'Feature');
    for (const element of feature.elements || []) {
      if (!element || (element.type !== 'scenario' && element.type !== 'scenario_outline' && element.type !== 'background' && element.type !== 'rule')) continue;
      const test = group.startTest(element.name || 'Scenario');
      test.fullName = `${feature.name || ''} - ${element.name || ''}`;
      test.addLabel(LabelName.FEATURE, feature.name || '');

      // Determine status from steps
      let finalStatus = Status.PASSED;
      for (const step of element.steps || []) {
        const stepResult = step.result || {};
        const mapped = cucumberStatusToAllure(stepResult.status);
        if (mapped === Status.FAILED) {
          finalStatus = Status.FAILED;
          break;
        }
        if (mapped === Status.BROKEN && finalStatus !== Status.FAILED) {
          finalStatus = Status.BROKEN;
        }
        if (mapped === Status.SKIPPED && finalStatus === Status.PASSED) {
          finalStatus = Status.SKIPPED;
        }
      }

      test.testResult.status = finalStatus;
      try {
        test.endTest();
      } catch (err) {
        // Retry: ensure directory exists and try writing directly
        console.warn('Error when ending test, attempting to ensure results directory and retry:', err.message);
        try {
          ensureResultsDir(resultsDir);
          // try writing the result directly
          runtime.writeResult(test.testResult);
        } catch (err2) {
          console.error('Failed to write test result after retry:', err2);
        }
      }
    }
    try {
      group.endGroup();
    } catch (err) {
      console.warn('Error when ending group:', err.message);
    }
  }

  // write environment info
  try {
    runtime.writeEnvironmentInfo({ NODE_ENV: process.env.NODE_ENV || 'test' });
  } catch (err) {
    console.warn('Failed to write environment info:', err.message);
  }
  console.log('Converted cucumber.json to Allure results in', resultsDir);
}

if (require.main === module) main();
