import { pick } from 'lodash-es'
import ky, { type KyInstance } from 'ky'

type Options = {
  apiUrl: string
  appVersionNo: string
  smartPhoneId: string
  icCardId: string
  pass: string
}

type LoginResp = {
  accessToken: string
  authCd: string
  resultKbn: string
  userInfoDto: {
    corpFlg: boolean
    dispIcCardId: string
    icCardId: string
    knjFirstNm: string
    knjLastNm: string
    planNm: string
    userId: string
  }
}

type ErrorInfoDto = {
  errorCd: string
  errorMessage: string
  errorPointKbn: null
  linkUrl: null
  linkUrlTitle: null
}

type BookResp = {
  accessToken: string
  bookingId: number | null
  corpFlg: string | null
  errorInfoDto: ErrorInfoDto | null
  nearestReserveFlg: boolean
  nextExpireTcPoint: number
  nextExpireTcPointYear: null
  resultKbn: string
  tcPoint: number
  visibleNextExpireTcPoint: boolean
  visibleTcPoint: boolean
}

class TimesCar {
  private accessToken: string | null = null
  private http: KyInstance

  constructor(private options: Options) {
    this.http = ky.create({
      headers: {
        'User-Agent':
          'iTcpQuickApps/2.13.8 (jp.co.park24.iTcpQuickApps; build:20240625.0; iOS 18.0.1) Alamofire/2.13.8',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      hooks: {
        beforeRequest: [
          (request) => {
            console.log('Request URL:', request.url)
            console.log('Request Method:', request.method)
            console.log('Request Headers:', [...request.headers])
            request
              .clone()
              .text()
              .then((body) => console.log('Request Body:', body))
          },
        ],
        afterResponse: [
          async (_, __, response) => {
            if (response.headers.get('Content-Type')?.includes('text/csv')) {
              const text = await response.text()
              if (!text.startsWith('0')) {
                throw new Error(text)
              }
              let json = null
              try {
                json = JSON.parse(text.slice(3))
              } catch (e) {
                throw new Error(text)
              }
              return new Response(JSON.stringify(json), {
                headers: { 'Content-Type': 'application/json' },
              })
            }
            return response
          },
        ],
      },
    })
  }

  async login() {
    const requestBody = pick(this.options, [
      'appVersionNo',
      'smartPhoneId',
      'icCardId',
      'pass',
    ])
    const searchParams = new URLSearchParams()
    searchParams.set('command', 'Login.login_licenseCheck_Tx')
    searchParams.set('dto', JSON.stringify(requestBody))

    const data = await this.http
      .post(this.options.apiUrl, {
        body: searchParams,
      })
      .json<LoginResp>()

    this.accessToken = data.accessToken
    return data
  }

  async book(
    stationCd: string,
    carId: number,
    startTime: number,
    endTime: number,
  ) {
    if (!this.accessToken) {
      await this.login()
    }

    const requestBody = {
      accessToken: this.accessToken,
      exemptNocFlg: true,
      appVersionNo: this.options.appVersionNo,
      extendHour: 0,
      extendMinute: 0,
      biometricAuthLoginFlg: false,
      startTime,
      endTime,
      planPackLinkId: 1,
      smartPhoneId: this.options.smartPhoneId,
      stationCd,
      carId,
    }
    const searchParams = new URLSearchParams()
    searchParams.set('command', 'Reserve.reserve_Tx')
    searchParams.set('dto', JSON.stringify(requestBody))

    const data = await this.http
      .post(this.options.apiUrl, {
        body: searchParams,
      })
      .json<BookResp>()

    if (data.bookingId === null) {
      throw new Error(data.errorInfoDto?.errorMessage)
    }

    return data
  }
}

export default TimesCar
