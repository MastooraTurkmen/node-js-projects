// container for all the handlers

const crypto = require('crypto')
const https = require('https')
const config = require('./config')
const queryString = require('querystring')
cons

// helpers object
const helpers = {}

// create a SHA256 hash
helpers.hash = (str) => {
    if (typeof (str) == 'string' && str.length > 0) {
        const hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex')
        return hash
    } else {
        return false
    }
}

// parse a JSON string to an object in all cases, without throwing
helpers.parseJsonToObject = (str) => {
    try {
        const obj = JSON.parse(str)
        return obj
    } catch (error) {
        return {}
    }
}



helpers.createRandomString = function (strLength) {
    strLength = typeof (strLength) == 'number' && strLength > 0 ? strLength : false;
    if (strLength) {
        // define all the possible characters that could go into a string
        const possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';

        // start the final string
        let str = '';
        for (i = 1; i <= strLength; i++) {
            // get a random character from the possibleCharacters string
            const randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
            // append this character to the final string
            str += randomCharacter;
        }
        // return the final string
        return str;
    } else {
        return false;
    }
}

// send an SMS message via Twilio
helpers.sendTwilioSms = (phone, msg, callback) => {
    // validate parameters
    phone = typeof (phone) == 'string' && phone.trim().length == 10 ? phone.trim() : false
    msg = typeof (msg) == 'string' && msg.trim().length > 0 && msg.trim().length <= 1600 ? msg.trim() : false

    if (phone && msg) {
        // configure the request payload
        const payload = {
            From: config.twilio.fromPhone,
            To: '+93' + phone,
            Body: msg
        }

        // stringify the payload
        const stringPayload = queryString.stringify(payload)

        // configure the request details
        const requestDetails = {
            'protocol': 'https:',
            'hostname': 'api.twilio.com',
            'method': 'POST',
            'path': '/2010-04-01/Accounts/' + config.twilio.accountSid + '/Messages.json',
            'auth': config.twilio.accountSid + ':' + config.twilio.authToken,
            'headers': {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(stringPayload)
            }
        }

        // instantiate the request object
        const req = https.request(requestDetails, (res) => {
            // grab the status of the sent request
            const status = res.statusCode
            // callback successfully if the request went through
            if (status == 200 || status == 201) {
                callback(false)
            } else {
                callback('Status code returned was ' + status)
            }
        });

        // bind to the error event so it doesn't get thrown
        req.on('error', (e) => {
            callback(e)
        })

        // add the payload
        req.write(stringPayload)

        // end the request
        req.end()

    } else {
        callback('Given parameters were missing or invalid')
    }
}

// get the string content of a template
helpers.getTemplate = (templateName, data, callback) => {
    templateName = typeof (templateName) == 'string' && templateName.length > 0 ? templateName : false

    data = typeof (data) == 'object' && data !== null ? data : {}

    if (templateName) {
        const templatesDir = path.join(__dirname, '/../templates/')
        fs.readFile(templatesDir + templateName + '.html', 'utf8', (err, str) => {
            if (!err && str && str.length > 0) {
                const finalString = helpers.interpolate(str, data)
                callback(false, finalString)
            } else {
                callback('No template could be found')
            }
        })
    } else {
        callback('A valid template name was not specified')
    }
}

// add the universal header and footer to a string, and pass provided data object to the header and footer for interpolation
helpers.addUniversalTemplates = (str, data, callback) => {
    str = typeof (str) == 'string' && str.length > 0 ? str : ''
    data = typeof (data) == 'object' && data !== null ? data : {}

    // get the header
    helpers.getTemplate('_header', data, (err, headerString) => {
        if (!err && headerString) {
            // get the footer
            helpers.getTemplate('_footer', data, (err, footerString) => {
                if (!err && footerString) {
                    // add them all together
                    const fullString = headerString + str + footerString
                    callback(false, fullString)
                } else {
                    callback('Could not find the footer template')
                }
            })
        } else {
            callback('Could not find the header template')
        }
    })
}


//take a given string and a data object and find/replace all the keys within it
helpers.interpolate = (str, data) => {
    str = typeof (str) == 'string' && str.length > 0 ? str : ''
    data = typeof (data) == 'object' && data !== null ? data : {}

    // add the templateGlobals to the data object, prepending their key name with "global"

    for (let keyName in config.templateGlobals) {
        if (config.templateGlobals.hasOwnProperty(keyName)) {
            data['global.' + keyName] = config.templateGlobals[keyName]
        }
    }

    // for each key in the data object, insert its value into the string at the corresponding placeholder
    for (let key in data) {
        if (data.hasOwnProperty(key) && typeof (data[key]) == 'string') {
            const replace = data[key]
            const find = '{' + key + '}'
            str = str.replace(find, replace)
        }
    }
    return str
}


// get the contents of a static (public) asset
helpers.getStaticAsset = (fileName, callback) => {
    fileName = typeof (fileName) == 'string' && fileName.length > 0 ? fileName : false
    if (fileName) {
        const publicDir = path.join(__dirname, '/../public/')
        fs.readFile(publicDir + fileName, (err, data) => {
            if (!err && data) {
                callback(false, data)
            } else {
                callback('No file could be found')
            }
        })
    } else {
        callback('A valid file name was not specified')
    }
}



module.exports = helpers
