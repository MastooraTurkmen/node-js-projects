const Product = require('../model/productModel')
const { getPostData } = require('../utils')

// @desc Get all products
// @route GET /api/products
async function getProducts(req, res) {
    try {
        const products = await Product.findAll()
        res.writeHead(200, { "Content-Type": "application/json" })
        res.end(JSON.stringify(products))
    } catch (error) {
        console.log(error)
    }
}

// @desc Get Single products
// @route GET /api/product/:id
async function getProduct(req, res, id) {
    try {
        const product = await Product.findById(id)
        if (!product) {
            res.writeHead(404, { "Content-Type": "application/json" })
            res.end(JSON.stringify({ message: "Product not found" }))
        } else {
            res.writeHead(200, { "Content-Type": "application/json" })
            res.end(JSON.stringify(product))
        }
    } catch (error) {
        console.log(error)
    }
}

// @desc Create a product
// @route POST /api/products
async function createProduct(req, res) {
    try {

        const body = await getPostData(req)
        const { title, description, price } = JSON.parse(body)

        const product = {
            title,
            description,
            price
        }

        const newProduct = await Product.create(product)

        res.writeHead(201, { "Content-Type": "application/json" })
        return res.end(JSON.stringify(newProduct))
    } catch (error) {
        console.log(error)
    }
}


module.exports = { getProducts, getProduct, createProduct }