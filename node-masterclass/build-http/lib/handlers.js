const _data = require('./data')
const helpers = require('./helpers')

// define a request handler
let handlers = {}

// Users handler
handlers.users = (data, callback) => {
    const acceptableMethods = ['post', 'get', 'put', 'delete'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._users[data.method](data, callback);
    } else {
        callback(405);
    }
}

// container for the users submethods

handlers._users = {}


// users - post
handlers._users.post = (data, callback) => {
    const firstName = typeof (data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    const lastName = typeof (data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    const phone = typeof (data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    const password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    const tosAgreement = typeof (data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;
    if (firstName && lastName && phone && password && tosAgreement) {
        // make sure that the user does not already exist
        // store the user
        callback(200);
        _data.read('users', phone, (err, data) => {
            if (err) {
                // hash the password
                const hashedPassword = helpers.hash(password)
                if (hashedPassword) {
                    const userObject = {
                        'firstName': firstName,
                        'lastName': lastName,
                        'phone': phone,
                        'hashedPassword': hashedPassword,
                        'tosAgreement': true
                    }
                    // store the user
                    _data.create('users', phone, userObject, (err) => {
                        if (!err) {
                            callback(200);
                        } else {
                            console.log(err);
                            callback(500, { 'Error': 'Could not create the new user' });
                        }
                    })

                } else {
                    callback(500, { 'Error': 'Could not hash the user\'s password.' })
                }

            } else {
                // user already exists
                callback(400, { 'Error': 'A user with that phone number already exists' })
            }
        })
    } else {
        callback(400, { 'Error': 'Missing required fields' })
    }
}

// users - get
handlers._users.get = (data, callback) => {
    // check for required field
    const phone = typeof (data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
    if (phone) {
        _data.read('users', phone, (err, data) => {
            if (!err && data) {
                // removed the hashed password from the user object before updating it
                delete data.hashedPassword
                callback(200, data)
            } else {
                callback(400, { 'Error': 'The specified user does not exist' })
            }
        })
    } else {
        callback(400, { 'Error': 'Missing required field' })
    }
}

// users - put  
// required field: phone
// @TODO Only let an authenticated user delete their object. Don't let them delete anyone else's.
// Optional data: firstName, lastName, password (at least one must be specified)
handlers._users.put = (data, callback) => {
    const phone = typeof (data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    const firstName = typeof (data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    const lastName = typeof (data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    const password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

    if (phone) {
        if (firstName || lastName || password) {
            // lookup the user
            _data.read('users', phone, (err, data) => {
                if (!err && data) {
                    if (firstName) {
                        data.firstName = firstName
                    }
                    if (lastName) {
                        data.lastName = lastName
                    }
                    if (password) {
                        data.hashedPassword = helpers.hash(password)
                    }

                    // store the new updates
                    _data.update('users', phone, data, (err) => {
                        if (!err) {
                            callback(200)
                        } else {
                            console.log(err)
                            callback(500, { 'Error': 'Could not update the user.' })
                        }
                    })

                } else {
                    callback(400, { 'Error': 'Could not find the specified user.' })
                }
            })
        } else {
            callback(400, { 'Error': 'Missing fields to update.' })
        }
    } else {
        callback(400, { 'Error': 'Missing required field' })
    }
}

// delete user
//
handlers._users.delete = (data, callback) => {
    // check that the phone number is valid
    const phone = typeof (data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
    if (phone) {
        // lookup the user
        _data.read('users', phone, (err, data) => {
            if (!err && data) {
                _data.delete('users', phone, (err) => {
                    if (!err) {
                        callback(200)
                    } else {
                        callback(500, { 'Error': 'Could not delete the specified user' })
                    }
                })
            } else {
                callback(400, { 'Error': 'Could not find the specified user.' })
            }
        })
    } else {
        callback(400, { 'Error': 'Missing required field' })
    }
}

// ping handler
handlers.ping = (data, callback) => {
    callback(200)
}
