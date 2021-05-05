import { Loader } from "../Loader";

export function Chargebee (loader: Loader) {
  loader.chargebee = window.Chargebee.init({
    site: `censorbot${loader.staging ? '-test' : ''}`
  })
}