import { WorkerManager } from "../managers/Worker";

import { MessageHandler } from '../filters/Messages'
import { APIMessage } from "discord-api-types";

export function setupFilters (worker: WorkerManager) {
  worker.on('MESSAGE_CREATE', (msg) => {
    MessageHandler(worker, msg)
  })
  worker.on('MESSAGE_UPDATE', (msg) => {
    MessageHandler(worker, msg as APIMessage)
  })
}