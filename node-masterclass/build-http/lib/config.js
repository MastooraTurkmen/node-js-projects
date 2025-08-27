let environment = {};

environment.staging = {
    'httpPort': 3000,
    'httpsPort': 3001,
    'envName': 'staging',
    'hashingSecret': 'thisIsASecret'
}

environment.production = {
    'httpPort': 5000,
    'httpsPort': 5001,
    'envName': 'production',
    'hashingSecret': 'thisIsASecret'
}

// determine which environment was passed as a command-line argument
let currentEnvironment = typeof (process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// check that the current environment is one of the environments above, if not, default to staging
const environmentToExport = typeof (environment[currentEnvironment]) == 'object' ? environment[currentEnvironment] : environment.staging;

module.exports = environmentToExport;