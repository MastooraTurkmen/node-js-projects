const $ = selector => document.querySelector(selector);

export default class View {
    #csvFile = $('#csv-file');
    #fileSize = $('#file-size');
    #form = $('#form');
    #progress = $('#progress');
    #report = $('#report');
    #workerEnabled = $('#workerEnabled');

    setFileSize(size) {
        this.#fileSize.innerHTML = `File size: ${size}\n`;
    }

    isWorkerEnabled() {
        return this.#workerEnabled.checked
    }

    updateProgress(value) {
        this.#progress.value = value;
    }

    configureOnFileChange(fn) {
        this.#csvFile.addEventListener('change', e => {
            fn(e.target.files[0])
        })
    }

    configureOnSubmit(fn) {
        this.#form.reset()
        this.#form.addEventListener('submit', e => {
            e.preventDefault();
            const file = this.#csvFile.files[0];

            // this validation should be in the controller layer!
            if (!file) {
                alert("Please select a file");
                return;
            }
            const form = new FormData(e.currentTarget)
            const description = form.get('description');
            fn({ description, file })
        })
    }
}