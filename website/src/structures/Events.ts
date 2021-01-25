interface EventList {
  [key: string]: object
}

class Events {
  currentEvents: EventList = {}

  addEventListener (page: string, event: string, fn: (data: any) => void) {
    let registering = false
    if (!this.currentEvents[event]) {
      registering = true
      this.currentEvents[event] = {}
    }
    this.currentEvents[event][page] = fn
    
    if (registering) {
      window.addEventListener(event, (d) => {
        Object.values(this.currentEvents[event]).forEach(res => {
          if (res) res(d)
        })
      })
    }
  }

  removeEventListener (page: string, event?: string) {
    if (event && (!this.currentEvents[event] || !this.currentEvents[event][page])) return
    
    if (event) {
      this.currentEvents[event][page] = null
      delete this.currentEvents[event][page]
    } else {
      Object.keys(this.currentEvents).forEach(eventName => {
        this.removeEventListener(page, eventName)
      })
    }
  }
}

export const events = new Events()