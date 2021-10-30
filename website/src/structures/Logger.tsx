import { store } from 'store'
import { setLoading } from 'store/reducers/loading.reducer'
import Swal from 'sweetalert2'

const Toast = Swal.mixin({
  toast: true,
  position: 'bottom-left',
  showConfirmButton: false,
  showCloseButton: true,
  timer: 3000,
})

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class Logger {
  static setLoading(loading: boolean) {
    store.dispatch(setLoading(loading))
  }

  static log(from: string, message: string) {
    console.log(
      `%c[${from}]%c ${message}`,
      'color: purple; font-weight: bold',
      '',
    )
  }

  static error(msg: string) {
    void Toast.fire({
      icon: 'error',
      title: msg,
    })
  }
}
