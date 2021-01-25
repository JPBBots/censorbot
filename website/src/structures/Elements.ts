interface ElementOptions {
  elm: keyof HTMLElementTagNameMap | 'text'
  id?: string
  classes?: string[]
  text?: string
  attr?: object
  events?: {
    [key in keyof DocumentEventMap]?: (key: DocumentEventMap[key]) => any
  }
  children?: (ElementOptions | HTMLElement | null)[]
  created?: (elm: HTMLElement) => void
}

export class E {
  static create (opts: ElementOptions | HTMLElement): HTMLElement | Text {
    if (opts instanceof Element) return opts
    const { elm, id, classes, text, attr, events, children, created } = opts
    if (elm === 'text') return document.createTextNode(text)
    const element = document.createElement(elm)
    if (id) element.id = id
    if (classes) element.classList.add(...classes)
    if (text) element.innerText = text
    if (attr) Object.keys(attr).forEach(key => element.setAttribute(key, attr[key]))
    if (events) Object.keys(events).forEach(event => element.addEventListener(event, events[event]))
    if (children) children.forEach(child => child && element.appendChild(this.create(child)))

    if (created) created(element)

    return element
  }

  static set (element: HTMLElement | HTMLElement[], set: ElementOptions[], keepCurrent?: boolean) {
    if (!Array.isArray(element)) element = [element]
    element.forEach(e => {
      if (!keepCurrent) e.innerHTML = ''
      set.forEach(elm => e.appendChild(this.create(elm)))
    })
  }

  static delete (element: HTMLElement) {
    element.parentElement.removeChild(element)
  }
}