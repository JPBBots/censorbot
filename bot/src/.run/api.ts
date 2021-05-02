import { ApiManager } from '../managers/Api'

module.exports = new ApiManager()

// @ts-expect-error
global.api = module.exports
