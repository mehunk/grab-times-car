/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.toml`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */
import { getConfig } from './config'
import TimesCar from './times-car'
import { getTimestamp, isJapanWeekend, isJapanHoliday } from './utils'

async function grab(env: Env) {
  const config = getConfig()
  const startTime = getTimestamp(10)
  const endTime = getTimestamp(20)
  const timesCar = new TimesCar({
    apiUrl: env.API_URL,
    appVersionNo: config.APP_VERSION_NO,
    smartPhoneId: config.SMART_PHONE_ID,
    icCardId: config.IC_CARD_ID,
    pass: env.PASS,
  })

  for (const { stationCd, carId } of config.STATION_CAR) {
    try {
      const res = await timesCar.book(stationCd, carId, startTime, endTime)
      console.log(res)
      break
    } catch (e) {
      console.error(e)
    }
  }
}

export async function runScheduled(env: Env) {
  const isHoliday = await isJapanHoliday()
  const isWeekend = isJapanWeekend()
  if (!isHoliday && !isWeekend) {
    console.log('Not a holiday or weekend, skipping booking.')
    return
  }
  return grab(env)
}

export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(runScheduled(env))
  },
  fetch() {
    return new Response('This Worker is intended for scheduled tasks only.')
  },
} satisfies ExportedHandler<Env>
