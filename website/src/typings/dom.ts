import { Loader } from "../Loader";
import { Logger } from "../structures/Logger";

declare global {
  interface History { 
    onurlchange: () => void
  }
  interface Window {
    __LOADER: Loader
    LOGGER: Logger
    dev: boolean
    discordOAuthExtra?: string
  }
  
  interface WebData {
    [key: string]: PageData
  }

  interface PageData {
    html: string;
    css?: string;
  }
}
