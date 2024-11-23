# Grab Times Car

## Overview

This is a simple bot that can help users to reserve a sharing car in advance.

## Prerequisites

- Times Car Membership
- Cloudflare Workers Account
- Node.js

## Development

### Clone this repository

```shell
$ git clone <repository-url>
```

### Install dependencies

```shell
$ npm install
```

### Create `config.json` with your own settings

Rename `config.sample.json` in `src` directory to `config.json`, then fill your own `SMART_PHONE_ID` and `IC_CARD_ID`.

`IC_CARD_ID` is your Times Car Membership ID.
`SMART_PHONE_ID` is the ID of your mobile phone. You need to get it by yourself.

Also, you need to fill compositions of `STATION_CD` and `CAR_ID` which you want to reserve.

### Run the script locally

```shell
$ npm run dev
```

### Test the script

```shell
$ curl --location 'http://localhost:8787/__scheduled'
```

## Deployment

```shell
$ npm run deploy
```

## How do we know whether the reservation is successful?

If the reservation is successful, you will receive an email from Times Car. However, if the reservation is failed, there is no notifications for now. You need to check the logs of Cloudflare to figure out the reason.

## Q & A

### How to get your `SMART_PHONE_ID`?

### How to get `STATION_CD`?

### How to get `CAR_ID`?
