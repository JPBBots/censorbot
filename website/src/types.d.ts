import { Api } from "./structures/Api";

declare global {
  namespace NodeJS {
    interface Global {
      api: Api
    }
  }
}
