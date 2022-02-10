import { BaseExtension } from './Base'

import fetch from 'node-fetch'

import { loadImage, Canvas } from 'skia-canvas'

interface OcrWord {
  WordText: string
  Left: number
  Top: number
  Height: number
  Width: number
}

export interface OcrLine {
  LineText: string
  Words: OcrWord[]
}

interface OcrParsedResult {
  TextOverlay: {
    Lines: OcrLine[]
  }
  ParsedText: string
}

export interface OcrResult {
  ParsedResults: OcrParsedResult[]
}

export class Ocr extends BaseExtension {
  public async resolve(image: string): Promise<OcrResult | undefined> {
    const res = await fetch(
      `https://api.ocr.space/parse/imageurl?${new URLSearchParams({
        apikey: this.ai.ocrToken,
        url: image,
        OCREngine: '2',
        isOverlayRequired: 'true'
      })}`
    )
      .then(async (x) => {
        if (!x.ok) throw new Error('OCR Failed')

        return await x.json()
      })
      .catch(() => undefined)

    this.working = !!res

    return res
  }

  async cover(imageUrl: string, lines: OcrLine[]): Promise<Buffer> {
    const image = await loadImage(imageUrl)
    const canvas = new Canvas(image.width, image.height)
    const ctx = canvas.getContext('2d')

    ctx.drawImage(image, 0, 0)

    ctx.fillStyle = '#000000'

    for (const line of lines) {
      for (const word of line.Words) {
        ctx.fillRect(word.Left, word.Top, word.Width, word.Height)
      }
    }

    return await canvas.toBuffer('png')
  }
}
