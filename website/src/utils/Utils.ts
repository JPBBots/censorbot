import Swal from 'sweetalert2'

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class Utils {
  static async wait (time: number): Promise<void> {
    return await new Promise((resolve) => {
      setTimeout(() => {
        resolve()
      }, time)
    })
  }

  static async openWindow (url: string, text?: string): Promise<void> {
    return await new Promise(resolve => {
      const win = window.open(url, 'window', 'width=600,height=1000')
      if (!win) {
        void Swal.fire({
          icon: 'question',
          title: text ?? 'Open',
          showConfirmButton: true,
          showCancelButton: true
        }).then(res => {
          if (res.isConfirmed) resolve(this.openWindow(url, text))
        })
        return
      }
      const interval = setInterval(() => {
        if (win.closed) {
          resolve()
          clearInterval(interval)
        }
      })
    })
  }
}
