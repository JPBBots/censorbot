const Pieces = {
  generate: (obj: any): any => {
    const pieces: Record<string, any> = {}
    function generatePiece (toObj: any, key: string, working?: string): void {
      const val = key ? toObj[key] : toObj
      if (!val || val.constructor !== Object) {
        pieces[`${working ? `${working}.` : ''}${key}`] = val
      } else {
        Object.keys(val).forEach(x => generatePiece(val, x, `${working ? `${working}.` : ''}${key}`))
      }
    }
    generatePiece(obj, '')

    return pieces
  },
  normalize: (obj: any): any => {
    const res: Record<any, any> = {}
    Object.keys(obj).forEach(piece => {
      const split = piece.split('.')
      let objToBe = res
      for (let i = 0; i < split.length - 1; i++) {
        if (!objToBe[split[i]]) objToBe[split[i]] = {}
        objToBe = objToBe[split[i]]
      }
      objToBe[split[split.length - 1]] = obj[piece]
    })

    return res
  }
}

export default Pieces
