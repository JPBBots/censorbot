import { Loader } from "../Loader"
import { Utils } from "../structures/Utils"

export async function Staging (loader: Loader) {
  if (loader.staging) {
    console.log('a')
    await loader.api.waitForUser()
    if (!loader.api.user.admin) {
      Utils.setPath('/no')
      Utils.presentLoad('You cannot view staging.')
      document.querySelector('nav').parentElement.removeChild(document.querySelector('nav'))
      loader.api = null

      setInterval(() => {
        Utils.setPath('/no')
        Utils.presentLoad('You cannot view staging.')
        document.querySelector('nav').parentElement.removeChild(document.querySelector('nav'))
        loader.api = null
      }, 1000)
    }
  }
}