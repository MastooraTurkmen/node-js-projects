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

        // get the token from the headers
        const token = typeof (data.headers.token) == 'string' ? data.headers.token : false;
        // verify that the given token is valid for the phone number
        handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
            if (tokenIsValid) {
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
                callback(403, { 'Error': 'Missing required token in header, or token is invalid' })
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

            // get the token from the headers
            const token = typeof (data.headers.token) == 'string' ? data.headers.token : false;

            // verify that the given token is valid for the phone number
            handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
                if (tokenIsValid) {
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
                    callback(403, { 'Error': 'Missing required token in header, or token is invalid' })
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

        // get the token from the headers
        const token = typeof (data.headers.token) == 'string' ? data.headers.token : false;

        // verify that the given token is valid for the phone number
        handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
            if (tokenIsValid) {
                // lookup the user
                _data.read('users', phone, (err, data) => {
                    if (!err && data) {
                        _data.delete('users', phone, (err) => {
                            if (!err) {
                                // delete each of the checks associated with the user
                                const userChecks = typeof (data.checks) == 'object' && data.checks instanceof Array ? data.checks : []
                                const checksToDelete = userChecks.length

                                if (checksToDelete > 0) {
                                    let checksDeleted = 0
                                    let deletionErrors = false

                                    // loop through the checks
                                    userChecks.forEach((checkId) => {
                                        // delete the check
                                        _data.delete('checks', checkId, (err) => {
                                            if (err) {
                                                deletionErrors = true
                                            }
                                            checksDeleted++
                                            if (checksDeleted == checksToDelete) {
                                                if (!deletionErrors) {
                                                    callback(200)
                                                } else {
                                                    callback(500, { 'Error': 'Errors encountered while attempting to delete all of the user\'s checks. All checks may not have been deleted from the system successfully.' })
                                                }
                                            }
                                        })
                                    })
                                } else {
                                    callback(200)
                                }

                            } else {
                                callback(500, { 'Error': 'Could not delete the specified user' })
                            }
                        })
                    } else {
                        callback(400, { 'Error': 'Could not find the specified user.' })
                    }
                })
            } else {
                callback(403, { 'Error': 'Missing required token in header, or token is invalid' })
            }
        })
    } else {
        callback(400, { 'Error': 'Missing required field' })
    }
}


// tokens handler
handlers.tokens = (data, callback) => {
    const acceptableMethods = ['post', 'get', 'put', 'delete'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._tokens[data.method](data, callback);
    } else {
        callback(405);
    }
}

handlers._tokens = {}

handlers._tokens.post = (data, callback) => {
    const phone = typeof (data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    const password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

    if (phone && password) {
        // lookup the user who matches that phone number
        _data.read('users', phone, function (err, userData) {
            if (!err && userData) {
                // hash the sent password
                const hashedPassword = helpers.hash(password)
                if (hashedPassword == userData.hashedPassword) {
                    // if valid, create a new token with a random name. Set expiration date 1 hour in the future
                    const tokenId = helpers.createRandomString(20)
                    const expires = Date.now() + 1000 * 60 * 60
                    const tokenObject = {
                        'phone': phone,
                        'id': tokenId,
                        'expires': expires
                    }

                    // store the token
                    _data.create('tokens', tokenId, tokenObject, (err) => {
                        if (!err) {
                            callback(200, tokenObject)
                        } else {
                            callback(500, { 'Error': 'Could not create the new token' })
                        }
                    })
                } else {
                    callback(400, { 'Error': 'Password did not match the specified user\'s stored password' })
                }
            } else {
                callback(400, { 'Error': 'Could not find the specified user.' })
            }
        })
    } else {
        callback(400, { 'Error': 'Missing required fields' })
    }
}

// tokens - get
// required data: id
// optional data: none
handlers._tokens.get = (data, callback) => {
    // check that the id is valid
    const id = typeof (data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
    if (id) {
        // lookup the token
        _data.read('tokens', id, (err, data) => {
            if (!err && data) {
                callback(200, data)
            } else {
                callback(400, { 'Error': 'The specified token does not exist' })
            }
        })
    } else {
        callback(400, { 'Error': 'Missing required field' })
    }
}

// tokens - put
// required data: id, extend
// optional data: none
handlers._tokens.put = (data, callback) => {
    const id = typeof (data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false;
    const extend = typeof (data.payload.extend) == 'boolean' && data.payload.extend == true ? true : false;
    if (id && extend) {
        // lookup the existing token
        _data.read('tokens', id, (err, tokenData) => {
            if (!err && tokenData) {
                // check to make sure the token isn't already expired
                if (tokenData.expires > Date.now()) {
                    // set the expiration an hour from now
                    tokenData.expires = Date.now() + 1000 * 60 * 60

                    // store the new updates
                    _data.update('tokens', id, tokenData, (err) => {
                        if (!err) {
                            callback(200)
                        } else {
                            callback(500, { 'Error': 'Could not update the token\'s expiration.' })
                        }
                    })
                } else {
                    callback(400, { 'Error': 'The token has already expired and cannot be extended.' })
                }
            } else {
                callback(400, { 'Error': 'Specified token does not exist.' })
            }
        })
    } else {
        callback(400, { 'Error': 'Missing required field(s) or field(s) are invalid.' })
    }
}

// tokens - delete
// required data: id
// optional data: none
handlers._tokens.delete = (data, callback) => {
    // check that the id is valid
    const id = typeof (data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
    if (id) {
        // lookup the token
        _data.read('tokens', id, (err, data) => {
            if (!err && data) {
                _data.delete('tokens', id, (err) => {
                    if (!err) {
                        callback(200)
                    } else {
                        callback(500, { 'Error': 'Could not delete the specified token' })
                    }
                })
            } else {
                callback(400, { 'Error': 'Could not find the specified token.' })
            }
        })
    } else {
        callback(400, { 'Error': 'Missing required field' })
    }
}


//  verify if a given token id is currently valid for a given user
handlers._tokens.verifyToken = (id, phone, callback) => {
    // lookup the token
    _data.read('tokens', id, (err, tokenData) => {
        if (!err && tokenData) {
            // check that the token is for the given user and has not expired
            if (tokenData.phone == phone && tokenData.expires > Date.now()) {
                callback(true)
            } else {
                callback(false)
            }
        } else {
            callback(false)
        }
    })
}

// checks handler
handlers.checks = (data, callback) => {
    const acceptableMethods = ['post', 'get', 'put', 'delete']
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._checks[data.method](data, callback)
    } else {
        callback(405)
    }
}

// container for all the checks methods
handlers._checks = {}


// checks - post
// required data: protocol, url, method, successCodes, timeoutSeconds
// optional data: none
handlers._checks.post = (data, callback) => {
    // validate inputs
    const protocol = typeof (data.payload.protocol) == 'string' && ['http', 'https'].indexOf(data.payload.protocol) > -1 ? data.payload.protocol : false
    const url = typeof (data.payload.url) == 'string' && data.payload.url.trim().length > 0 ? data.payload.url.trim() : false
    const method = typeof (data.payload.method) == 'string' && ['post', 'get', 'put', 'delete'].indexOf(data.payload.method) > -1 ? data.payload.method : false
    const successCodes = typeof (data.payload.successCodes) == 'object' && data.payload.successCodes instanceof Array && data.payload.successCodes.length > 0 ? data.payload.successCodes : false
    const timeoutSeconds = typeof (data.payload.timeoutSeconds) == 'number' && data.payload.timeoutSeconds % 1 === 0 && data.payload.timeoutSeconds >= 1 && data.payload.timeoutSeconds <= 5 ? data.payload.timeoutSeconds : false

    if (protocol && url && method && successCodes && timeoutSeconds) {
        // get the token from the headers
        const token = typeof (data.headers.token) == 'string' ? data.headers.token : false

        // lookup the user by reading the token
        _data.read('tokens', token, (err, tokenData) => {
            if (!err && tokenData) {
                const userPhone = tokenData.phone

                // lookup the user data
                _data.read('users', userPhone, (err, userData) => {
                    if (!err && userData) {
                        const userChecks = typeof (userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : []
                        // verify that the user has less than the number of max-checks-per-user
                        if (userChecks.length < config.maxChecks) {
                            // create a random id for the check
                            const checkId = helpers.createRandomString(20)

                            // create the check object, and include the user's phone
                            const checkObject = {
                                'id': checkId,
                                'userPhone': userPhone,
                                'protocol': protocol,
                                'url': url,
                                'method': method,
                                'successCodes': successCodes,
                                'timeoutSeconds': timeoutSeconds
                            }

                            // save the object
                            _data.create('checks', checkId, checkObject, (err) => {
                                if (!err) {
                                    // add the check id to the user's object
                                    userData.checks = userChecks
                                    userData.checks.push(checkId)

                                    // save the new user data
                                    _data.update('users', userPhone, userData, (err) => {
                                        if (!err) {
                                            // return the data about the new check
                                            callback(200, checkObject)
                                        } else {
                                            callback(500, { 'Error': 'Could not update the user with the new check.' })
                                        }
                                    })
                                } else {
                                    callback(500, { 'Error': 'Could not create the new check' })
                                }
                            })
                        } else {
                            callback(400, { 'Error': 'The user already has the maximum number of checks (' + config.maxChecks + ')' })
                        }
                    } else {
                        callback(403)
                    }
                })
            } else {
                callback(403, { 'Error': 'Missing required token in header, or token is invalid' })
            }
        })
    } else {
        callback(400, { 'Error': 'Missing required inputs, or inputs are invalid' })
    }
}

// check get
// required data: id

handlers._checks.get = function (data, callback) {
    // check for required field
    const id = typeof (data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 10 ? data.queryStringObject.id.trim() : false;
    if (id) {
        // lookup the checks
        _data.read('checks', id, (err, checkData) => {
            if (!err && checkData) {
                // get the token from the headers
                const token = typeof (data.headers.token) == 'string' ? data.headers.token : false;
                // verify that the given token is valid and belongs to the user who created the check
                const id = checkData.userPhone
                handlers._tokens.verifyToken(token, id, (tokenIsValid) => {
                    if (tokenIsValid) {
                        // return check data
                        callback(200, checkData)
                    } else {
                        callback(403, { 'Error': 'Missing required token in header, or token is invalid' })
                    }
                })

            } else {
                callback(400, { 'Error': 'The specified check does not exist' })
            }
        })
    } else {
        callback(400, { 'Error': 'Missing required field' })
    }
}

// checks - put
// required data: id
// optional data: protocol, url, method, successCodes, timeoutSeconds (one must be sent)
handlers._checks.put = (data, callback) => {
    // check for required field
    const id = typeof (data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false;
    // check for optional fields
    const protocol = typeof (data.payload.protocol) == 'string' && ['http', 'https'].indexOf(data.payload.protocol) > -1 ? data.payload.protocol : false
    const url = typeof (data.payload.url) == 'string' && data.payload.url.trim().length > 0 ? data.payload.url.trim() : false
    const method = typeof (data.payload.method) == 'string' && ['post', 'get', 'put', 'delete'].indexOf(data.payload.method) > -1 ? data.payload.method : false
    const successCodes = typeof (data.payload.successCodes) == 'object' && data.payload.successCodes instanceof Array && data.payload.successCodes.length > 0 ? data.payload.successCodes : false
    const timeoutSeconds = typeof (data.payload.timeoutSeconds) == 'number' && data.payload.timeoutSeconds % 1 === 0 && data.payload.timeoutSeconds >= 1 && data.payload.timeoutSeconds <= 5 ? data.payload.timeoutSeconds : false

    // error if id is invalid
    if (id) {

        // check to make sure one or more optional fields has been sent
        if (protocol || url || method || successCodes || timeoutSeconds) {

            // lookup the check
            _data.read('checks', id, (err, checkData) => {
                if (!err && checkData) {
                    // get the token from the headers
                    const token = typeof (data.headers.token) == 'string' ? data.headers.token : false;
                    // verify that the given token is valid and belongs to the user who created the check
                    const id = checkData.userPhone
                    handlers._tokens.verifyToken(token, id, (tokenIsValid) => {
                        if (tokenIsValid) {
                            // update check data where necessary
                            if (protocol) {
                                checkData.protocol = protocol
                            }
                            if (url) {
                                checkData.url = url
                            }
                            if (method) {
                                checkData.method = method
                            }
                            if (successCodes) {
                                checkData.successCodes = successCodes
                            }
                            if (timeoutSeconds) {
                                checkData.timeoutSeconds = timeoutSeconds
                            }

                            // store the new updates
                            _data.update('checks', id, checkData, (err) => {
                                if (!err) {
                                    callback(200)
                                } else {
                                    callback(500, { 'Error': 'Could not update the check.' })
                                }
                            })
                        } else {
                            callback(403, { 'Error': 'Missing required token in header, or token is invalid' })
                        }
                    })
                } else {
                    callback(400, { 'Error': 'Check ID did not exist.' })
                }
            })
        } else {
            callback(400, { 'Error': 'Missing fields to update.' })
        }
    } else {
        callback(400, { 'Error': 'Missing required field' })
    }
}

// checks - delete
// required data: id
// optional data: none
handlers._checks.delete = (data, callback) => {
    // check that the id is valid
    const id = typeof (data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
    if (id) {
        // lookup the check
        _data.read('checks', id, (err, checkData) => {
            if (!err && checkData) {
                // get the token from the headers
                const token = typeof (data.headers.token) == 'string' ? data.headers.token : false;
                // verify that the given token is valid for the phone number
                const id = checkData.userPhone
                handlers._tokens.verifyToken(token, id, (tokenIsValid) => {

                    if (tokenIsValid) {
                        // delete the check data
                        _data.delete('checks', id, (err) => {
                            if (!err) {
                                // lookup the user
                                _data.read('users', id, (err, userData) => {
                                    if (!err && userData) {
                                        const userChecks = typeof (userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : []

                                        // remove the deleted check from their list of checks
                                        const checkPosition = userChecks.indexOf(id)
                                        if (checkPosition > -1) {
                                            userChecks.splice(checkPosition, 1)
                                            // re-save the user's data
                                            userData.checks = userChecks
                                            _data.update('users', id, userData, (err) => {
                                                if (!err) {
                                                    callback(200)
                                                } else {
                                                    callback(500, { 'Error': 'Could not update the user.' })
                                                }
                                            })
                                        } else {
                                            callback(500, { 'Error': 'Could not find the check on the user\'s object, so could not remove it.' })
                                        }
                                    } else {
                                        callback(500, { 'Error': 'Could not find the user who created the check, so could not remove the check from the list of checks on the user object.' })
                                    }
                                })
                            } else {
                                callback(500, { 'Error': 'Could not delete the specified check' })
                            }
                        })
                    } else {
                        callback(403, { 'Error': 'Missing required token in header, or token is invalid' })
                    }
                })
            } else {
                callback(400, { 'Error': 'Could not find the specified check.' })
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

// not found handler
handlers.notFound = (data, callback) => {
    callback(404)
}

module.exports = handlers