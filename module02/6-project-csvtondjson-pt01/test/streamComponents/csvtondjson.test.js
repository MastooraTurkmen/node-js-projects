import { expect, describe, it, jest } from "@jest/globals";
import CSVToNDJSON from "../../src/streamComponents/csvtondjson";

/*
id, name
01, erick
*/

describe("CSV to NDJSON test suite", () => {
    it("given a CSV string it should return a NDJSON string", () => {
        const csvString = `id,name,address\n01,erick,address01\n`;
        const csvToJSON = new CSVToNDJSON({
            delimiter: ',',
            headers: ['id', 'name', 'address']
        })

        const expected = JSON.stringify({ id: "01", name: "erick", address: "address01" })
        const fn = jest.fn()
        csvToJSON.on("data", fn)
        csvToJSON.write(csvString)
        csvToJSON.end()

        const [current] = fn.mock.lastCall
        expect(JSON.parse(current)).toStrictEqual(JSON.parse(expected))
    })
    it("it should work with strings that doesn't contains break lines at the end", () => {
        const csvString = `id,name,address\n01,erick,address01`;
        const csvToJSON = new CSVToNDJSON({
            delimiter: ',',
            headers: ['id', 'name', 'address']
        })

        const expected = JSON.stringify({ id: "01", name: "erick", address: "address01" })
        const fn = jest.fn()
        csvToJSON.on("data", fn)
        csvToJSON.write(csvString)
        csvToJSON.end()

        const [current] = fn.mock.lastCall
        expect(JSON.parse(current)).toStrictEqual(JSON.parse(expected))
    })
    it("it should work with files that has break lines in the begging in of the string", () => {
        const csvString = `\n\nid,name,address\n01,erick,address01\n02,ana,mystreet\n\n`;
        const csvToJSON = new CSVToNDJSON({
            delimiter: ',',
            headers: ['id', 'name', 'address']
        })

        const expected = [
            JSON.stringify({ id: "01", name: "erick", address: "address01" }),
            JSON.stringify({ id: "02", name: "ana", address: "mystreet" })

        ]

        const fn = jest.fn()
        csvToJSON.on("data", fn)
        csvToJSON.write(csvString)
        csvToJSON.end()

        const [firstCall] = fn.mock.calls[0]
        const [secondCall] = fn.mock.calls[1]

        expect(JSON.parse(firstCall)).toStrictEqual(JSON.parse(expected[0]))
        expect(JSON.parse(secondCall)).toStrictEqual(JSON.parse(expected[1]))
    })
})