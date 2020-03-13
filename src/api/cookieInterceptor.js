import {container} from "../bottle/bottle";
import _ from 'lodash'
import log from "loglevel";

const logger= log.getLogger('cookieInterceptor')

export default {
    request: function (url, options) {
        if (!url.includes(container.config.api.path)) {
            return [url, options]
        }
        if (!container.config.di.cookie) {
            return [url, options]
        }
        _.merge(options, {
            headers: {
                Cookie: container.cookieService.cookie
            }
        })
        logger.debug('send', url, options)
        return [url, options]
    },
    requestError: function (error) {
        return Promise.reject(error);
    },
    response: async function (response) {
        if (!response.url.includes(container.config.api.path)) {
            return response
        }
        if (!container.config.di.cookie) {
            return response
        }
        let cookie = response.headers.get('set-cookie')
        if (!cookie) {
            // container.logger.warn('no cookie received from server')
        } else {
            cookie = cookie.match(/(\w+=(\w|\d)+)/)[0]
            container.cookieService.cookie = cookie
            logger.debug('receive', cookie)
        }
        return response
    },

    responseError: function (error) {
        return Promise.reject(error);
    }
}