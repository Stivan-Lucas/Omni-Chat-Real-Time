// src/server.ts
import { app } from './app.ts'
import { env } from './config/environment.ts'
import { Texts } from './constants/texts.ts'

app.listen({ host: env.HOST, port: env.PORT }, (err, address) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }

  app.log.info(
    Texts.server.success.documentationOn.replace('{address}', address),
  )
})
