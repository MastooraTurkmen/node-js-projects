import ComponentBuilder from "./componentBuilder.js";

let components

function addMessageOnTop(msg) {
    const table = components.table

    const { content } = table.items.shift()
    const items = table.items.map(item => item.content)
    table.clearItems()

    // we put the title first on the top
    table.addItem(content)
    const toBold = msg => `{bold}${msg}{/}`
    table.addItem(toBold(msg))

    items.forEach(item => table.addItem(toBold(msg)))

    components.screen.render()
}

function log(msg) {
    addMessageOnTop(msg)
}

function renderUi() {

    components = new ComponentBuilder().setScreen({
        title: 'Mastering Nodejs Streams'
    }).setLayoutComponent().setFormComponent({
        onStart: () => {
            addMessageOnTop('Hello World' + Date.now());
        },
        onEnd: () => {

        }
    }).setDataTableComponent().build();

    console.log({ components });
    components.form.focus()
    components.screen.render()
}

export {
    renderUi,
    log
}