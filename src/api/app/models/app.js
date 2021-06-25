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
      const envelopes = await streamToArray(GherkinStreams.fromPaths(configuration.featurePaths, { includeSource: false, includeGherkinDocument: true, includePickles: true }));

      let gherkinDocument = null
      let pickles = []

      envelopes.forEach(element => {
        if (element.gherkinDocument) {
          gherkinDocument = element.gherkinDocument
        } else if (element.pickle && gherkinDocument) {
          const pickle = element.pickle

          if (pickleFilter.matches({ gherkinDocument, pickle })) {
            pickles.push({pickle})
          }
        }
      });

      return pickles
        .map((p) => p.pickle.uri)
        .reduce((accum, cV) => [...accum, ...(accum.includes(cV) ? [] : [cV])], []);
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

