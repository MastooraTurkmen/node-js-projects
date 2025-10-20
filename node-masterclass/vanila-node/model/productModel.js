const products = require('.../data/products.json')

function findAll() {
    return new Promise((resolve, reject) => {
        resolve(products)
    })
}


function findById() {
    return new Promise((resolve, reject) => {
        const product = products.find((p) => p.id === id)
        resolve(product)
    })
}

module.exports = { findAll, findById }