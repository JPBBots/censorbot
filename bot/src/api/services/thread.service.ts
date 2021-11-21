import { Injectable } from '@nestjs/common'
import { Thread } from 'discord-rose'

@Injectable()
export class ThreadService extends Thread {}
