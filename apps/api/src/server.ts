import { env } from '@infrastructure/config/env'
import { app } from './app'

const PORT = env.PORT

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${env.NODE_ENV} mode`)
})
