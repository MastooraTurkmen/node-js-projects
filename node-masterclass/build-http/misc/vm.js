// Running some arbitrary commands


const vm = require('vm');

// Create a context for the script to run in
let context = {
    "foo": 25,
};

// Define the script
const script = new vm.Script(`
    foo = foo * 2;
    const bar = foo + 1;
    const fizz = 52;
`);

// Run the script in the context
script.runInNewContext(context);

// Log out the context
console.log(context);