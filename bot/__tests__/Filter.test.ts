import { FilterType } from '@jpbbots/cb-typings'
import { Filter } from '../src/structures/Filter'

type filterSettings = Parameters<Filter['test']>[1]
const extendSettings = (extend: Partial<filterSettings>): filterSettings => {
  return {
    filter: [],
    filters: [],
    phrases: [],
    uncensor: [],
    words: [],
    ...extend
  }
}
const baseSettings = extendSettings({})

describe('filter', () => {
  const filter = new Filter()

  describe('base filter', () => {
    it('censor fuck', () => {
      const result = filter.test('fuck', extendSettings({ filters: ['en'] }))

      expect(result).not.toBe(null)
      expect(result!.type).toBe(FilterType.BaseFilter)
    })

    it('should not censor fuck', () => {
      const result = filter.test('fuck', baseSettings)

      expect(result).toBe(null)
    })

    it('should not censor assessment', () => {
      const result = filter.test(
        'assessment',
        extendSettings({ filters: ['en'] })
      )

      expect(result).toBe(null)
    })

    describe('uncensor', () => {
      it('should not censor shit', () => {
        const result = filter.test(
          'shit',
          extendSettings({ filters: ['en'], uncensor: ['shit'] })
        )

        expect(result).toBe(null)
      })
    })
  })

  describe('server filter', () => {
    it('should not censor test', () => {
      const result = filter.test('test', baseSettings)

      expect(result).toBe(null)
    })

    it('should censor test', () => {
      const result = filter.test('test', extendSettings({ filter: ['test'] }))

      expect(result).not.toBe(null)
      expect(result!.type).toBe(FilterType.ServerFilter)
    })

    describe('phrases', () => {
      it('should censor hello world', () => {
        const result = filter.test(
          'a hello world b',
          extendSettings({ phrases: ['hello world'] })
        )

        expect(result).not.toBe(null)
        expect(result!.type).toBe(FilterType.ServerFilter)
      })

      it('should not censor helloworld', () => {
        const result = filter.test(
          'a helloworld b',
          extendSettings({ phrases: ['hello world'] })
        )

        expect(result).toBe(null)
      })
    })
  })

  describe('ranges', () => {
    it('"fuck" should range [0, 0]', () => {
      const result = filter.test('fuck', extendSettings({ filters: ['en'] }))

      const range = result!.ranges[0]

      expect(range[0]).toBe(0)
      expect(range[1]).toBe(0)
    })

    it('"test fuck" should range [1, 1]', () => {
      const result = filter.test(
        'test fuck',
        extendSettings({ filters: ['en'] })
      )

      const range = result!.ranges[0]

      expect(range[0]).toBe(1)
      expect(range[1]).toBe(1)
    })

    it('"test fuck" in server filter should be [[0, 0], [1, 1]]', () => {
      const result = filter.test(
        'test fuck',
        extendSettings({ filters: ['en'], filter: ['test'] })
      )

      const range1 = result!.ranges[0]
      const range2 = result!.ranges[1]

      expect(range1[0]).toBe(0)
      expect(range1[1]).toBe(0)

      expect(range2[0]).toBe(1)
      expect(range2[1]).toBe(1)
    })
  })
})
