let environment = {};

environment.staging = {
    'httpPort': 3000,
    'httpsPort': 3001,
    'envName': 'staging',
    'hashingSecret': 'thisIsASecret',
    'maxChecks': 5,
    'twilio': {
        'accountSid': '',
        'authToken': '',
        'fromPhone': ''
    },
    'templateGlobals': {
        'appName': 'UptimeChecker',
        'companyName': 'NotARealCompany, Inc.',
        'yearCreated': '2024',
        'baseUrl': 'http://localhost:3000/'
    }
}

// Testing environment
environment.staging = {
    'httpPort': 4000,
    'httpsPort': 4001,
    'envName': 'testing',
    'hashingSecret': 'thisIsASecret',
    'maxChecks': 5,
    'twilio': {
        'accountSid': '',
        'authToken': '',
        'fromPhone': ''
    },
    'templateGlobals': {
        'appName': 'UptimeChecker',
        'companyName': 'NotARealCompany, Inc.',
        'yearCreated': '2025',
        'baseUrl': 'http://localhost:4000/'
    }
}

environment.production = {
    'httpPort': 5000,
    'httpsPort': 5001,
    'envName': 'production',
    'hashingSecret': 'thisIsASecret',
    'maxChecks': 5,
    'templateGlobals': {
        'appName': 'UptimeChecker',
        'companyName': 'NotARealCompany, Inc.',
        'yearCreated': '2024',
        'baseUrl': 'http://localhost:5000/'
    }
}

// determine which environment was passed as a command-line argument
let currentEnvironment = typeof (process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// check that the current environment is one of the environments above, if not, default to staging
const environmentToExport = typeof (environment[currentEnvironment]) == 'object' ? environment[currentEnvironment] : environment.staging;

module.exports = environmentToExport;
