const tsConfig = require('../tsconfig');

function buildBase (config) {
  return {
    basePath: "",
    plugins: [],
    client: { clearContext: false },
    coverageIstanbulReporter: {
      dir: require("path").join(__dirname, "../coverage"),
      reports: ["html", "lcovonly"],
      fixWebpackSourcePaths: true
    },
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ["Chrome"],
    singleRun: false
  }
}

const testingEnvironments = {
  services: {
    entry: './test.services.ts',
    plugins: [
      require("karma-typescript"),
      require("karma-jasmine"),
      require("karma-chrome-launcher"),
      require("karma-jasmine-html-reporter"),
      require("karma-coverage-istanbul-reporter"),
    ],
    frameworks: ["jasmine", "karma-typescript"],
    files: ['app/core/services/tag-info.service.ts'],
    preprocessors: {
      'app/core/services/tag-info.service.ts': ["karma-typescript"]
    },
    typescriptPreprocessors: {
      options: tsConfig.options,
      transformPath: function(path) {
        return path.replace(/\.ts$/,'js')
      }
    },
    reporters: ["progress"]
  },
  application: {
    plugins: [
      require("karma-jasmine"),
      require("karma-chrome-launcher"),
      require("karma-jasmine-html-reporter"),
      require("karma-coverage-istanbul-reporter"),
      require("@angular-devkit/build-angular/plugins/karma")
    ],
    frameworks: ["jasmine", "@angular-devkit/build-angular"],
    reporters: ["progress", "kjhtml"]
  }
}


module.exports = function(config) { 
  const testingConfig = Object.assign(buildBase(config), testingEnvironments[process.env.TESTING_ENV || 'application']);
  return config.set(testingConfig);
}
