const test = require('ava');
const sinon = require('sinon');

const appRootDir = process.cwd();

const App = require('../../../../src/api/app/models/app');

// ////////////////////////////////////////////////
// getActiveFeatureFileUris
// ////////////////////////////////////////////////

const setupGetActiveFeatureFileUris = async ({ tagExpression }) => {
  const theFeatureFilesThatExist = [`${appRootDir}/testResources/features/app_scan.feature`, `${appRootDir}/testResources/features/simple_math.feature`];

  const configuration = {
    pickleFilterOptions: { cwd: appRootDir, featurePaths: ['testResources/features'], names: [], tagExpression },
    featurePaths: theFeatureFilesThatExist
  };
  const getConfigurationFake = sinon.fake.returns(configuration);
  const cucumberCli = { getConfiguration: getConfigurationFake };
  const app = new App();

  return app.getActiveFeatureFileUris(cucumberCli);
};

test('Given tagExpression: (@app_scan) - when getActiveFeatureFileUris is invoked - then active feature file Uris app_scan.feature should be returned', async (t) => {
  t.plan(1);
  // Active feature files are based on the cucumber.tagExpression defined in config.
  // https://cucumber.io/docs/cucumber/api/#tag-expressions
  // https://github.com/cucumber/cucumber/tree/master/tag-expressions#migrating-from-old-style-tags
  const tagExpression = '(@app_scan)';
  const activeFeatureFileUris = await setupGetActiveFeatureFileUris({ tagExpression });
  t.deepEqual(activeFeatureFileUris, [`${appRootDir}/testResources/features/app_scan.feature`]);
});

test('Given tagExpression: (@simple_math) - when getActiveFeatureFileUris is invoked - then active feature file Uris simple_math.feature should be returned', async (t) => {
  t.plan(1);
  // Active feature files are based on the cucumber.tagExpression defined in config.
  // https://cucumber.io/docs/cucumber/api/#tag-expressions
  // https://github.com/cucumber/cucumber/tree/master/tag-expressions#migrating-from-old-style-tags
  const tagExpression = '(@simple_math)';
  const activeFeatureFileUris = await setupGetActiveFeatureFileUris({ tagExpression });
  t.deepEqual(activeFeatureFileUris, [`${appRootDir}/testResources/features/simple_math.feature`]);
});

test('Given tagExpression: (@app_scan or @simple_math) - when getActiveFeatureFileUris is invoked - then active feature file Uris app_scan.feature and simple_math.feature should be returned', async (t) => {
  t.plan(1);
  // Active feature files are based on the cucumber.tagExpression defined in config.
  // https://cucumber.io/docs/cucumber/api/#tag-expressions
  // https://github.com/cucumber/cucumber/tree/master/tag-expressions#migrating-from-old-style-tags
  const tagExpression = '(@app_scan or @simple_math)';
  const activeFeatureFileUris = await setupGetActiveFeatureFileUris({ tagExpression });
  t.deepEqual(activeFeatureFileUris, [`${appRootDir}/testResources/features/app_scan.feature`, `${appRootDir}/testResources/features/simple_math.feature`]);
});

// Since cucumber.getTestCasesFromFilesystem was removed, the following test cases fail, including the ones not yet implemented.

test('Given tagExpression: (@app_scan and @simple_math) - when getActiveFeatureFileUris is invoked - then no active feature file Uris should be returned', async (t) => {
  t.plan(1);
  // Active feature files are based on the cucumber.tagExpression defined in config.
  // https://cucumber.io/docs/cucumber/api/#tag-expressions
  // https://github.com/cucumber/cucumber/tree/master/tag-expressions#migrating-from-old-style-tags
  const tagExpression = '(@app_scan and @simple_math)';
  const activeFeatureFileUris = await setupGetActiveFeatureFileUris({ tagExpression });
  t.deepEqual(activeFeatureFileUris, []);
  // What we get is: [`${appRootDir}/testResources/features/app_scan.feature`, `${appRootDir}/testResources/features/simple_math.feature`]
});

test('Given tagExpression: (not @simple_math) - when getActiveFeatureFileUris is invoked - then active feature file Uris app_scan.feature should be returned', async (t) => {
  t.plan(1);
  // Active feature files are based on the cucumber.tagExpression defined in config.
  // https://cucumber.io/docs/cucumber/api/#tag-expressions
  // https://github.com/cucumber/cucumber/tree/master/tag-expressions#migrating-from-old-style-tags
  const tagExpression = '(not @simple_math)';
  const activeFeatureFileUris = await setupGetActiveFeatureFileUris({ tagExpression });
  t.deepEqual(activeFeatureFileUris, [`${appRootDir}/testResources/features/app_scan.feature`]);
  // What we get is: [`${appRootDir}/testResources/features/simple_math.feature`]
});

// The following are also not catered for currently.
// Ideas for creating feature files with tags to test for here: https://cucumber.io/docs/cucumber/api/#tags

// @wip and not @slow
// Scenarios tagged with @wip that are not also tagged with @slow

// (@smoke or @ui) and (not @slow)
// Scenarios tagged with @smoke or @ui that are not also tagged with @slow

// not @foo and (@bar or @zap)
// Scenarios tagged with @bar or @zap that are not also tagged with @foo

// Continue implementing failing tests?

// ////////////////////////////////////////////////
// getTestPlanText
// ////////////////////////////////////////////////

test('Given activeFeatureFileUris: [appRootDir/testResources/features/app_scan.feature] - when getTestPlanText is invoked - then app_scan.feature test plan should be returned', async (t) => {
  t.plan(1);
  const activeFeatureFileUris = [`${appRootDir}/testResources/features/app_scan.feature`];
  const app = new App();
  const expectedTestPlanText = `@app_scan
Feature: Web application free of security vulnerabilities known to Zap

# Before hooks are run before Background

Background:
  Given a new test session based on each build user supplied testSession
  And each build user supplied route of each testSession is navigated
  And a new scanning session based on each build user supplied testSession
  And the application is spidered for each testSession
  And all active scanners are disabled

Scenario: The application should not contain vulnerabilities known to Zap that exceed the build user defined threshold
  Given all active scanners are enabled
  When the active scan is run
  Then the vulnerability count should not exceed the build user defined threshold of vulnerabilities known to Zap
`;
  const testPlanText = await app.getTestPlanText(activeFeatureFileUris);
  t.deepEqual(testPlanText, expectedTestPlanText);
});

test('Given activeFeatureFileUris: [appRootDir/testResources/features/app_scan.feature, appRootDir/testResources/features/simple_math.feature] - when getTestPlanText is invoked - then app_scan.feature and simple_math.feature test plans should be returned', async (t) => {
  t.plan(1);
  const activeFeatureFileUris = [`${appRootDir}/testResources/features/app_scan.feature`, `${appRootDir}/testResources/features/simple_math.feature`];
  const app = new App();
  const expectedTestPlanText = `@app_scan
Feature: Web application free of security vulnerabilities known to Zap

# Before hooks are run before Background

Background:
  Given a new test session based on each build user supplied testSession
  And each build user supplied route of each testSession is navigated
  And a new scanning session based on each build user supplied testSession
  And the application is spidered for each testSession
  And all active scanners are disabled

Scenario: The application should not contain vulnerabilities known to Zap that exceed the build user defined threshold
  Given all active scanners are enabled
  When the active scan is run
  Then the vulnerability count should not exceed the build user defined threshold of vulnerabilities known to Zap


@simple_math
Feature: Simple maths
  In order to do maths
  As a developer
  I want to increment variables

  Scenario: easy maths
    Given a variable set to 1
    When I increment the variable by 1
    Then the variable should contain 2

  Scenario Outline: much more complex stuff
    Given a variable set to <var>
    When I increment the variable by <increment>
    Then the variable should contain <result>

    Examples:
      | var | increment | result |
      | 100 |         5 |    105 |
      |  99 |      1234 |   1333 |
      |  12 |         5 |     17 |
`;
  const testPlanText = await app.getTestPlanText(activeFeatureFileUris);
  t.deepEqual(testPlanText, expectedTestPlanText);
});
