export class Logger {
  static log (from: string, message: string) {
    console.log(`%c[${from}]%c ${message}`, 'color: purple; font-weight: bold', '')
  }

  static tell (message: string): Promise<void> {
    return new Promise(resolve => {
      setTimeout(() => {
        alert(message) // to change eventually
        resolve()
      }, 0)
    })
  }
}