import Service from "./service.js";

console.log('I am ready Worker is alive');
postMessage({ eventType: 'alive' })

const service = new Service();

onmessage = ({ data }) => {
    const { query, file } = data;
    console.log({ query, file });
    service.processFile({
        query,
        file,
        onOccurrenceUpdate: (args) => {
            postMessage({
                eventType: 'occurrenceUpdate',
                ...args
            })
        },
        onProgress: (total) => postMessage({
            eventType: 'progress',
            total
        })
    })
};