export const enumCombiner = (enumObj: any): number => {
  const values = Object.values(enumObj).filter(
    (x) => typeof x === 'number'
  ) as number[]

  return values.reduce((a, b) => a + b, 0)
}
