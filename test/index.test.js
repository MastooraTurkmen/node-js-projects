import { expect, test, describe, jest } from "@jest/globals";
import PaymentSubject from "../src/subjects/paymentSubject";
import Payment from "../src/events/payment";
import Marketing from "../src/observers/marketing";
import Shipment from "../src/observers/shipment";

describe("Test Suite for Observer Pattern", () => {
    test("#PaymentSubject notify observers", () => {
        const subject = new PaymentSubject()
        const observer = {
            update: jest.fn()
        }
        const data = "Hello World"
        const expected = data

        subject.subscribe(observer)
        subject.notify(data)

        expect(observer.update).toBeCalledWith(expected)
    })

    test.todo("#PaymentSubject should not notify unsubscribed observers")
    test.todo("#PaymentSubject should notify subject after a credit card transaction")
    test.todo("#All should notify subscribe after a credit card payment")
})