// dependencies

const fs = require('fs')
const path = require('path')
const helpers = require('./helpers')

// container for the module to be exported

const lib = {}

lib.baseDir = path.join(__dirname, '/../.data/')

lib.create = function (dir, file, data, callback) {
    // open the file for writing
    fs.open(lib.baseDir + dir + '/' + file + '.json', 'wx', (err, fileDescriptor) => {
        if (!err && fileDescriptor) {
            // convert data to string
            const stringData = JSON.stringify(data)

            // write to file and close it
            fs.writeFile(fileDescriptor, stringData, (err) => {
                if (!err) {
                    fs.close(fileDescriptor, (err) => {
                        if (!err) {
                            callback(false)
                        } else {
                            callback('Error closing new file')
                        }
                    })
                } else {
                    callback('Error writing to new file')
                }
            })
        } else {
            callback('Could not create new file, it may already exist')
        }
    })
}


lib.read = function (dir, file, callback) {
    fs.readFile(lib.baseDir + dir + '/' + file + '.json', 'utf8', (err, data) => {
        if (!err && data) {
            const parsedData = helpers.parseJsonToObject(data)
            callback(false, parsedData)
        } else {
            callback(err, data)
        }
    })
}

// update existing file

lib.update = function (dir, file, data, callback) {
    // open the file for writing
    fs.open(lib.baseDir + dir + '/' + file + '.json', 'r+', (err, fileDescriptor) => {
        if (!err && fileDescriptor) {
            // convert data to string
            const stringData = JSON.stringify(data)

            // truncate the file
            fs.truncate(fileDescriptor, (err) => {
                if (!err) {
                    // write to the file and close it
                    fs.writeFile(fileDescriptor, stringData, (err) => {
                        if (!err) {
                            fs.close(fileDescriptor, (err) => {
                                if (!err) {
                                    callback(false)
                                } else {
                                    callback('Error closing the file')
                                }
                            })
                        } else {
                            callback('Error writing to existing file')
                        }
                    })
                } else {
                    callback('Error truncating file')
                }
            })

        } else {
            callback('Could not open the file for updating, it may not exist yet')
        }
    })
}


// delete existing file
lib.delete = function (dir, file, callback) {
    // unlink the file
    fs.unlink(lib.baseDir + dir + '/' + file + '.json', (err) => {
        if (!err) {
            callback(false)
        } else {
            callback('Error deleting file')
        }
    })
}

// list all the items in a directory
lib.list = function (dir, callback) {
    fs.readdir(lib.baseDir + dir + '/', (err, data) => {
        if (!err && data && data.length > 0) {
            const trimmedFileNames = []
            data.forEach((fileName) => {
                trimmedFileNames.push(fileName.replace('.json', ''))
            })
            callback(false, trimmedFileNames)
        } else {
            callback(err, data)
        }
    })
}

// export the module

module.exports = lib