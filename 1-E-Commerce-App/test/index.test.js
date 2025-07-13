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

        expect(observer.update).toHaveBeenCalledWith(expected)
    })

    test("#PaymentSubject should not notify unsubscribed observers", () => {
        const subject = new PaymentSubject()
        const observer = {
            update: jest.fn()
        }
        const data = "Hello World"
        const expected = data

        subject.subscribe(observer)
        subject.unsubscribe(observer)
        subject.notify(data)

        expect(observer.update).not.toHaveBeenCalled()
    })
    test("#PaymentSubject should notify subject after a credit card transaction", () => {
        const subject = new PaymentSubject()
        const payment = new Payment(subject)

        const paymentSubjectNotifierSpy = jest.spyOn(
            subject,
            subject.notify.name
        )
        const data = { userName: "Erick", id: 3 }
        payment.creditCard(data)

        expect(paymentSubjectNotifierSpy).toHaveBeenCalledWith(data)

    })
    test("#All should notify subscribe after a credit card payment", () => {
        const subject = new PaymentSubject()
        const shipment = new Shipment()
        const marketing = new Marketing()

        const shipmentUpdateFnSpy = jest.spyOn(shipment, shipment.update.name)
        const marketingUpdateFnSpy = jest.spyOn(marketing, marketing.update.name)

        subject.subscribe(shipment)
        subject.subscribe(marketing)

        const payment = new Payment(subject)
        const data = { id: 4, userName: "May" }
        payment.creditCard(data)

        expect(shipmentUpdateFnSpy).toHaveBeenCalledWith(data)
        expect(marketingUpdateFnSpy).toHaveBeenCalledWith(data)
    })
})