import { addWeeks, set, isWeekend, format } from 'date-fns'
import { fromZonedTime, toZonedTime } from 'date-fns-tz'

import { getJapanHoliday } from './japan-holiday'

const timeZone = 'Asia/Tokyo'

function getJstDate() {
  // Convert the UTC time to a Tokyo date 2024-01-01 00:00:00 JST
  return toZonedTime(new Date(), timeZone)
}

function getReservableDate() {
  // 2024-01-01 00:00:00 UTC
  const JstDate = getJstDate()
  // 2024-01-15 00:00:00 UTC
  return addWeeks(JstDate, 2)
}

export async function isJapanHoliday() {
  const holidays = await getJapanHoliday()
  // 2024-01-15 00:00:00 UTC
  const JstDate = getReservableDate()
  // 2024-01-15
  const jstDateStr = format(JstDate, 'yyyy-MM-dd')
  return holidays[jstDateStr] !== undefined
}

export function isJapanWeekend() {
  const JstDate = getReservableDate()
  return isWeekend(JstDate)
}

export function getTimestamp(hours: number) {
  // 2024-01-15 00:00:00 UTC
  const reservableDate = getReservableDate()
  // 2024-01-15 10:00:00 or 20:00:00 UTC
  const targetTime = set(reservableDate, {
    hours,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
  })
  // Convert the Tokyo date back to valid UTC timestamp
  // 2024-01-15 01:00:00 or 11:00:00 UTC (JST +09:00)
  return fromZonedTime(targetTime, timeZone).getTime()
}
