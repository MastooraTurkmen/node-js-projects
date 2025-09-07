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