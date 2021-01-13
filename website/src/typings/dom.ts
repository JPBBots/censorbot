import { Loader } from "../Loader";

declare global {
  interface History { 
    onurlchange: () => void
  }
  interface Window {
    __LOADER: Loader
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
