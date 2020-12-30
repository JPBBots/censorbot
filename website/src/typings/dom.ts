import { Loader } from "../Loader";

declare global {
  interface History { 
    onurlchange: () => void
  }
  interface Window { 
    api: string
    __LOADER: Loader 
  }
  
  interface WebData {
    [key: string]: PageData
  }

  interface PageData {
    html: string;
    css?: string;
  }
}
