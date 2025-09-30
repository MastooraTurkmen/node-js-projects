// Application logic for the test runner
_app = {}

// Container for the tests
_app.tests = {}

// Add on the unit tests
_app.tests.unit = require('./unit')

// Count all the tests
_app.countTests = function () {
    const counter = 0
    for (let key in _app.tests) {
        if (_app.tests.hasOwnProperty(key)) {
            const subTests = _app.tests[key];
            for (const testName in subTests) {
                if (subTests.hasOwnProperty(testName)) {
                    counter++
                }
            }
        }
    }
    return counter;
}

// Run All the tests, collecting the errors and successes
_app.runTests = function () {
    const errors = [];
    const successes = 0;
    const limit = _app.countTests();
    const counter = 0;

    for (let key in _app.tests) {
        if (_app.tests.hasOwnProperty(key)) {
            const subTests = _app.tests[key]
            for (let testName in subTests) {
                if (subTests.hasOwnProperty(testName)) {
                    (function () {
                        const tmpTestName = testName;
                        const testValue = subTests[testName]

                        // Call the test
                        try {
                            testValue(function () {
                                // if it call back without throwing, then it succeeded, so log it in green
                                console.log('\x1b[32m%s\x1b[0m', tmpTestName)
                                counter++;
                                successes++;
                                if (counter == limit) {
                                    _app.produceTestReport(limit, successes, errors);
                                }
                            })
                        } catch (e) {
                            // IF it throws, then it failed, so capture the error thrown and log it in red
                            errors.push({
                                'name': testName,
                                'error': e
                            })
                            console.log('\x1b[31m%s\x1b[0m', tmpTestName)
                            counter++;
                            if (counter == limit) {
                                _app.produceTestReport(limit, successes, errors);
                            }
                        }
                    })()
                }
            }
        }
    }
}

// Produce a test outcome report
_app.produceTestReport = function (limit, successes, errors) {
    console.log("");
    console.log("----Begin----")
    console.log("")
    console.log("Total Test:", limit)
    console.log("Pass:", successes)
    console.log("Fail:", errors.length)
    console.log("");

    // If there are errors, print them in detail
    if (errors.length > 0) {
        console.log("----Begin ERROR details----")
        console.log("")

        errors.forEach(function (testError) {
            console.log('\x1b[31m%s\x1b[0m', testError.name)
            console.log(testError.error)
            console.log("")
        })

        console.log("")
        console.log("----End ERROR details----")
    }

    console.log("")
    console.log("----End TEST----")
}

// Run the tests
_app.runTests()