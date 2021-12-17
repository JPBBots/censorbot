import { Injectable } from '@nestjs/common'
import { Thread } from 'jadl'

@Injectable()
export class ThreadService extends Thread {}
