import { Loader } from "../Loader";
import { Utils } from "../structures/Utils";

export function Chargebee (loader: Loader) {
  loader.chargebee = window.Chargebee.init({
    site: `censorbot${loader.staging ? '-test' : ''}`
  })

  loader.chargebee.openPortal = () => {
    loader.chargebee.createChargebeePortal().open({
      close: async () => {
        await loader.api.fetch(true)
        Utils.reloadPage()
      }
    })
  }

  document.getElementById('portal').onclick = async () => {
    await loader.api.waitForUser()
    loader.chargebee.openPortal()
  }
}