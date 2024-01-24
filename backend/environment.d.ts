declare namespace NodeJS {
  interface ProcessEnv {
    PROXY_CURL_API: string
    HOST_URL: string
    AUTH_PASS: string
    EMAIL_ABLE_KEY: string
    MONGODB_DB_NAME:string
    MONGODB_URI:string
    HUBSPOT_TOKEN:string
  }
}
