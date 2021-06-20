import { BaseAI } from './Base'

import fetch from 'node-fetch'

export class Ocr extends BaseAI {
  public async resolve (image: string): Promise<string> {
    const res = await fetch(`https://api.ocr.space/parse/imageurl?${new URLSearchParams({
      apikey: this.ai.ocrToken,
      url: image,
      OCREngine: '2'
    })}`).then(async (x) => await x.json()).catch(() => ({}))

    return res?.ParsedResults?.[0]?.ParsedText ?? ''
  }
}
