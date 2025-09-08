const app = {}

// Configuration
app.config = {
    'sessionToken': false
}

// AJAX Client (for RESTful API)

app.client = {}

// Interface for making API calls
app.client.request = (headers, path, method, queryStringObject, payload, callback) => {
    // Set defaults
    headers = typeof (headers) == 'object' && headers !== null ? headers : {}
    path = typeof (path) == 'string' ? path : '/'
    method = typeof (method) == 'string' && ['POST', 'GET', 'PUT', 'DELETE'].indexOf(method.toUpperCase()) > -1 ? method.toUpperCase() : 'GET'
    queryStringObject = typeof (queryStringObject) == 'object' && queryStringObject !== null ? queryStringObject : {}
    payload = typeof (payload) == 'object' && payload !== null ? payload : {}
    callback = typeof (callback) == 'function' ? callback : false

    // For each query string parameter sent, add it to the path
    let requestUrl = path + '?'
    let counter = 0

    for (let queryKey in queryStringObject) {
        if (queryStringObject.hasOwnProperty(queryKey)) {
            counter++
            // If at least one query string parameter has already been added, prepend new ones with an ampersand
            if (counter > 1) {
                requestUrl += '&'
            }
            // Add the key and value
            requestUrl += queryKey + '=' + queryStringObject[queryKey]
        }
    }

    // Form the http request as a JSON type
    const xhr = new XMLHttpRequest()
    xhr.open(method, requestUrl, true)
    xhr.setRequestHeader('Content-Type', 'application/json')

    // FOR EACH HEADER sent, add it to the request
    for (let headerKey in headers) {
        if (headers.hasOwnProperty(headerKey)) {
            xhr.setRequestHeader(headerKey, headers[headerKey])
        }
    }

    // If there is a current session token set, add that as a header
    if (app.config.sessionToken) {
        xhr.setRequestHeader('token', app.config.sessionToken.id)
    }

    // When the request comes back, handle the response
    xhr.onreadystatechange = () => {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            const statusCode = xhr.status
            const responseReturned = xhr.responseText
            if (callback) {
                try {
                    const parsedResponse = JSON.parse(responseReturned)
                    callback(statusCode, parsedResponse)
                } catch (error) {
                    callback(statusCode, false)
                }
            }
        }
    }

    // Send the payload as JSON
    const payloadString = JSON.stringify(payload)
    xhr.send(payloadString)
}


// Bind the logout button
app.bindLogoutButton = () => {
    document.getElementById('logoutButton').addEventListener('click', (e) => {
        // Stop it from redirecting anywhere
        e.preventDefault()
        // Log the user out
        app.logUserOut()
    })
}

// Log the user out then redirect them
app.logUserOut = () => {
    // Get the current token id
    const tokenId = typeof (app.config.sessionToken.id) == 'string' ? app.config.sessionToken.id : false

    // Send the current token to the tokens endpoint to delete it
    const queryStringObject = {
        'id': tokenId
    }
    app.client.request(undefined, 'api/tokens', 'DELETE', queryStringObject, undefined, (statusCode, responsePayload) => {
        // Set the app.config.token as false
        app.setSessionToken(false)

        // Send the user to the logged out page
        window.location = '/session/deleted'
    })
}

// Bind the forms
app.bindForms = () => {
    if (document.querySelector('form')) {
        const allForms = document.querySelectorAll('form')
        for (let i = 0; i < allForms.length; i++) {
            allForms[i].addEventListener('submit', function (e) {
                // Stop it from submitting
                e.preventDefault()
                const formId = this.id
                const path = this.action
                let method = this.method.toUpperCase()

                // Hide the error message (if it's currently shown due to a previous error)
                document.querySelector('#' + formId + ' .formError').style.display = 'hidden'

                // Turn the inputs into a payload
                const payload = {}
                const elements = this.elements
                for (let i = 0; i < elements.length; i++) {
                    if (elements[i].type !== 'submit') {
                        // Determine class of element and set value accordingly
                        const classOfElement = typeof (elements[i].className) == 'string' ? elements[i].className : ''
                        const valueOfElement = elements[i].type == 'checkbox' ? elements[i].checked : elements[i].value
                        // Add to payload object
                        payload[elements[i].name] = valueOfElement
                    }
                }

                // If the method is DELETE, the payload should be a queryStringObject instead
                let queryStringObject = method == 'DELETE' ? payload : {}

                // Call the API
                app.client.request(undefined, path, method, queryStringObject, payload, (statusCode, responsePayload) => {
                    // Display an error on the form if needed
                    if (statusCode !== 200) {
                        if (statusCode == 403) {
                            // log the user out
                            app.logUserOut()
                        } else {
                            // Try to get the error from the api, or set a default error message
                            const error = typeof (responsePayload.Error) == 'string' ? responsePayload.Error : 'An error has occurred, please try again'
                            // Set the formError field with the error text
                            document.querySelector('#' + formId + ' .formError').innerHTML = error
                            // Show (unhide) the form error field on the form
                            document.querySelector('#' + formId + ' .formError').style.display = 'block'
                        }
                    } else {
                        // If successful, send to form response processor
                        app.formResponseProcessor(formId, payload, responsePayload)
                    }
                })
            })
        }
    }
}


// Load the data on the page
app.loadDataOnPage = () => {
    // Get the current page from the body class
    const bodyClasses = document.querySelector('body').classList
    const primaryClass = typeof (bodyClasses[0]) == 'string' ? bodyClasses[0] : false

    if (primaryClass == 'accountEdit') {
        app.loadAccountEditPage()
    }
}

// Load the account edit page specifically
app.loadAccountEditPage = () => {
    // Get the email address from the current token, or log the user out if none is there
    const phon = typeof (app.config.sessionToken.phon) == 'string' ? app.config.sessionToken.phon : false
    if (phon) {
        // Fetch the user data
        const queryStringObject = {
            'phon': phon
        }
        app.client.request(undefined, 'api/users', 'GET', queryStringObject, undefined, (statusCode, responsePayload) => {
            if (statusCode == 200) {
                // Put the data into the forms as values where needed
                document.querySelector('#accountEdit1 .phonInput').value = responsePayload.phon
                document.querySelector('#accountEdit1 .nameInput').value = responsePayload.name

                // Put the hidden phone field into both forms
                const hiddenPhoneInputs = document.querySelectorAll('input.hiddenPhoneInput')
                for (let i = 0; i < hiddenPhoneInputs.length; i++) {
                    hiddenPhoneInputs[i].value = responsePayload.phon
                }
            } else {
                // If the request comes back as something other than 200, log the user out (on the assumption that the api is down or the token is invalid)
                app.logUserOut()
            }
        })
    } else {
        app.logUserOut()
    }
}


// Init (bootstrapping)
app.init = () => {
    // Bind all form submissions
    app.bindForms()

    // Bind the logout button
    app.bindLogoutButton()

    // Get the token from localstorage
    app.getSessionToken()

    // Load data on the page
    app.loadDataOnPage()

    // Renew the token
    app.renewTokenLoop()
}

// Call the init processes after the window loads
window.onload = () => {
    app.init()
}