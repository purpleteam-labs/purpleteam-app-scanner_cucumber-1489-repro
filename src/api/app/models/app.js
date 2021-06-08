const { readFile } = require('fs').promises;
const cucumber = require('@cucumber/cucumber');
const { GherkinStreams } = require('@cucumber/gherkin-streams');


class App {
  constructor() {}

  async getActiveFeatureFileUris(cucumberCli) {
    const configuration = await cucumberCli.getConfiguration();
    const pickleFilter = (() => new (require('@cucumber/cucumber/lib/pickle_filter')).default(configuration.pickleFilterOptions))();

    const flatten = (o) => [].concat(...Object.keys(o)
      .map((k) => (typeof o[k] === 'object'
        ? flatten(o[k])
        : ({ [k]: o[k] }))));

    const activeTags = flatten(pickleFilter.tagFilter.tagExpressionNode).map((tagObj) => tagObj.value);

    const streamToArray = async (readableStream) => new Promise((resolve, reject) => {
      const items = [];
      readableStream.on('data', (item) => items.push(item));
      readableStream.on('error', (err) => reject(err));
      readableStream.on('end', () => resolve(items));
    });

    const activeFeatureFileUris = async () => {
      const envelopes = await streamToArray(GherkinStreams.fromPaths(configuration.featurePaths, { includeSource: false, includeGherkinDocument: false, includePickles: true }));
      const tagUriMaps = envelopes.map((e) => ({ tagName: e.pickle.tags[0].name, fileUri: e.pickle.uri }));
      const activeTagUriMaps = tagUriMaps.filter((tU) => activeTags.includes(tU.tagName));
      const activeUris = activeTagUriMaps.reduce((accum, cV) => [...accum, ...(accum.includes(cV.fileUri) ? [] : [cV.fileUri])], []);
      return activeUris;
    };

    return activeFeatureFileUris();
  }


  async getTestPlanText(activeFeatureFileUris) {
    return (await Promise.all(activeFeatureFileUris
      .map((aFFU) => readFile(aFFU, { encoding: 'utf8' }))))
      .reduce((accumulatedFeatures, feature) => `${accumulatedFeatures}${!accumulatedFeatures.length > 0 ? feature : `\n\n${feature}`}`, '');
  }
}


module.exports = App;

