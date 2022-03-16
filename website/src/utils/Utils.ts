import Swal from 'sweetalert2'

import { WindowOpener } from './WindowOpener'

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class Utils {
  static async wait(time: number): Promise<void> {
    return await new Promise((resolve) => {
      setTimeout(() => {
        resolve()
      }, time)
    })
  }

  static openWindow(url: string, text?: string) {
    return new WindowOpener(url)
      .fail(async () => {
        return await Swal.fire({
          text: text ?? 'Open',
          showConfirmButton: true,
          showCancelButton: true
        }).then((res) => {
          if (res.isDismissed) return false

          if (res.isConfirmed) return true

          return false
        })
      })
      .open()
  }

  static getCookie(_name: string) {
    const name = `${_name}=`
    const ca = document.cookie.split(';')
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i]
      while (c.charAt(0) === ' ') {
        c = c.substring(1)
      }
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length)
      }
    }
  }
}
