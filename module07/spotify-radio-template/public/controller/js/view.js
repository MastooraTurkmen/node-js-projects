export default class View {
  constructor() {
    this.btnStart = document.getElementById('start')
    this.btnStop = document.getElementById('stop')
    this.buttons = () => Array.from(document.querySelectorAll('button'))
    this.ignoreButtons = new Set(['unassigned'])
    async function onBtnClick(text) {}
    this.onBtnClick = onBtnClick
    this.DISABLE_BTN_TIMEOUT = 500
  }

  onLoad() {
    this.changeCommandBtnsVisibility()
    this.btnStart.onclick = this.onStartClicked.bind(this)
  }

  async onStartClicked({
    srcElement: {
      innerText
    }
  }) {
    const btnText = innerText
    this.toggleBtnStartButton()

    await this.onBtnClick(btnText)
    this.changeCommandBtnsVisibility(false)

    this.buttons()
      .filter(btn => this.notIsUnassignedButton(btn))
      .forEach(this.setupBtnAction.bind(this))
  }

  setupBtnAction(btn) {
    const text = btn.innerText.toLocaleLowerCase()
    if (text.includes('start')) return;

    if (text.includes('stop')) {
      btn.onclick = this.onStopBtn.bind(this)
      return
    }

    btn.onclick = this.onCommandClick.bind(this)
  }

  changeCommandBtnsVisibility(hide = true) {
    Array.from(document.querySelectorAll('[name=command]'))
      .forEach(btn => {
        const fn = hide ? 'add' : 'remove'
        btn.classList[fn]('unassigned')
        function onClickReset () {}
        btn.onclick = onClickReset
      })
  }

  async onCommandClick(item) {
    const {
      srcElement: {
        classList,
        innerText
      }
    } = item

    this.toggleDisableCommandBtn(classList)
    await this.onBtnClick(innerText)

    setTimeout(
      () => this.toggleDisableCommandBtn(classList),
      this.DISABLE_BTN_TIMEOUT
    );
  }

  toggleDisableCommandBtn(classList) {
    if (!classList.contains('active')) {
      classList.add('active')
      return;
    }

    classList.remove('active')
  }

  async onStopBtn({
    srcElement: {
      innerText
    }
  }) {
    // console.count('stop')
    this.toggleBtnStartButton(false)
    this.changeCommandBtnsVisibility(true)

    return this.onBtnClick(innerText)
  }

  toggleBtnStartButton(active = true) {
    if (active) {
      this.btnStart.classList.add('hidden')
      this.btnStop.classList.remove('hidden')
      return;
    }

    this.btnStop.classList.add('hidden')
    this.btnStart.classList.remove('hidden')
  }

  notIsUnassignedButton(btn) {
    const classes = Array.from(btn.classList)
    return !(!!classes.find(item => this.ignoreButtons.has(item)))
  }

  configureOnBtnClick(fn) {
    this.onBtnClick = fn
  }
}