import Controller from "./controller.js";
import Service from "./service.js";
import View from "./view.js";

// worker modules (type: 'module', import/export) is currently working only on chrome
// this means web worker works! but using import/export not!

const worker = new Worker('./src/worker.js', {
    type: 'module'
})

Controller.init({
    view: new View(),
    service: new Service(),
    worker
})