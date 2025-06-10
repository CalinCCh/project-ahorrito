import { hc } from 'hono/client'

import { AppType } from "@/app/api/[[...route]]/route"
import { getApiUrl } from "./api-config"

export const client = hc<AppType>(getApiUrl())