import type { ChapterNumeral } from '../chapters.ts'

/** Big display numeral: the primary story unit of data chapters. */
export function BigNumeral({ numeral }: { numeral: ChapterNumeral }) {
  return (
    <p className="mt-4">
      <span className="spec-num spec-num--stat">{numeral.value}</span>{' '}
      <span className="spec-unit">{numeral.unit}</span>
    </p>
  )
}
