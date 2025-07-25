import { expect, describe, it, jest, afterAll } from "@jest/globals";
import { log } from "../util.js";
import readline from "node:readline";
import Reporter from "./reporter.js";

describe("Reporter Test suite", () => {
    it('it should print progress status correctly', () => {
        const loggerMock = jest.fn()
        const reporter = new Reporter({
            logger: loggerMock
        })
        reporter.LINE_LENGTH_AFTER_TURNED_INTO_JSON = 0; // Disable length adjustment for testing
        const multipleCalls = 10
        const progress = reporter.progress(multipleCalls)

        for (let i = 1; i < multipleCalls; i++) {
            progress.write('1')
        }
        progress.emit('end')
        expect(loggerMock.mock.calls.length).toEqual(10)

        for (const index in loggerMock.mock.calls) {
            const [call] = loggerMock.mock.calls[index];
            const expected = (Number(index) + 1) * 10;
            expect(call).toStrictEqual(`processed ${expected}.00%`)
        }
    })
})