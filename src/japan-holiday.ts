import ky from 'ky'

export function getJapanHoliday() {
  return ky('https://holidays-jp.github.io/api/v1/date.json').json<
    Record<string, string>
  >()
}
