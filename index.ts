import { Config, load } from 'cloud-config-client'
require('dotenv').config()
export type ServiceConfig = {
    url: string
}
export type ConfigClient = {
    load: () => Promise<void>
    raw: Config,
    getService: (key: string) => ServiceConfig,
    config: { [key: string]: any },
    get: (key: string) => any
}

const createConfigObject = () => {
    async function doLoad() {
        try {
            const conf = await load({
                name: process.env.APPLICATION_NAME,
                profiles: process.env.CONFIG_PROFILES,
                label: process.env.CONFIG_LABEL.replace("/", "(_)"),
                endpoint: process.env.CONFIG_URL,
                auth: {
                    user: process.env.CONFIG_USERNAME,
                    pass: process.env.CONFIG_PASSWORD,
                }
            })
            if (conf instanceof Error) {
                throw conf
            }
            obj.config = conf.toObject()
            obj.raw = conf
        } catch (err) {
            console.error(err)
            throw err
        }
    }
    let obj: ConfigClient = {
        load: doLoad,
        config: undefined,
        raw: undefined,
        getService: (key) => {
            return obj.config.services[key]
        },
        get: (key) => {
            if (!obj.config) {
                throw Error("You must load the config first")
            }
            return obj.config.get(key)
        }
    }
    return obj
}
export const config = createConfigObject()