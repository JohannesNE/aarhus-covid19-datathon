const _ = require('lodash');
const delay = require('delay');
const AwaitLock = require('await-lock').default;

const rateLimitOrigin = Object.freeze({
    TWITTER: 'TWITTER',
    LOCAL: 'LOCAL'
});

/* we are using the low rate limit  https://developer.twitter.com/en/docs/tweets/post-and-engage/api-reference/get-statuses-lookup */

const DEFAULT_APP_RATE_LIMITS = new Map([
    ['tweets/search/all', {limit: 300, remaining: 300, prRequestTimeLimit: 1000}], //prRequestTimeLimit defines time to elapse between request (optional)
    ['tweets', {limit: 300, remaining: 300, prRequestTimeLimit: 1000}], //prRequestTimeLimit defines time to elapse between request (optional)
]);

class TwitterRateLimiter {

    #twitter;

    constructor(twitter, name, sleepAfterNewWindow = 0) {
        this.#twitter = twitter;
        this._name = name;
        this._rateLimit = new Map();
        this.appOnlyToken = this.#twitter.authType === 'App';
        this._sleepAfterNewWindow = sleepAfterNewWindow; // used when more hydrators are running so we don't hit the api to hard
        if (!this.appOnlyToken) {
           throw new Error('DEFAULT_USER_RATE_LIMITS is not yet implemented'); // make a DEFAULT_USER_RATE_LIMITS and test if appOnlyToken is false in _getDefaultRateLimit(endpoint)
        }
        this._locks = new Map();
        for (let endPoint of DEFAULT_APP_RATE_LIMITS.keys()) {
            this._locks.set(endPoint, new AwaitLock());
        }
    }

    decrementRateLimit(endPoint) {
        let limit = this._getRateLimit(endPoint);
        if (limit) {
            limit.remaining = limit.remaining - 1;
        }
    }

    getRateLimit(endPoint) {
        return this._getRateLimit(endPoint);
    }

    setRateLimitFromResponseHeader(endPoint, headers) {
        let limit = {
            limit: parseInt(headers.get('x-rate-limit-limit')),
            remaining: parseInt(headers.get('x-rate-limit-remaining')),
            reset: parseInt(headers.get('x-rate-limit-reset')),
            lastRequestMs: Date.now(),
            origin: rateLimitOrigin.TWITTER
        };
        this._setRateLimitIfLatest(endPoint, limit);
    }

    /**
     *
     * @param endPoint
     * @param [beforeRelease] a function to execute before the lock is released anxd given to the next acquirer waiting
     * @returns {Promise<void>}
     */
    async waitForOpenWindow(endPoint, beforeRelease) {
        try {
            await this._locks.get(endPoint).acquireAsync();

            let limit = this._getRateLimit(endPoint);
            if (!limit) {
                let tempLimit = {limit: 0, remaining: 0, reset: 0, lastRequestMs: 0, origin: rateLimitOrigin.LOCAL};
                this._setRateLimitIfLatest(endPoint, tempLimit);
                limit = await this._updateRateLimitFromTwitter(endPoint); // fix the implementation of this when api 2.0 supports rate limit stats
            }

            let elapsed = Date.now() - limit.lastRequestMs;
            let defaultRateLimit = this._getDefaultRateLimit(endPoint);
            if (defaultRateLimit.prRequestTimeLimit && defaultRateLimit.prRequestTimeLimit > elapsed) {
                await delay(defaultRateLimit.prRequestTimeLimit - elapsed);
            }

            let threshold = 2; // 2 just to be sure

            while (limit.remaining < threshold) {
                let now = new Date();
                let epochSeconds = Math.trunc(now.getTime() / 1000);
                let waitMillis = ((limit.reset - epochSeconds) * 1000) + 1000; //the extra 1000 is just to be sure
                if (waitMillis > 0) {
                    if (process.env.NODE_ENV === "development") {
                        console.log(`${this._name ? this._name + " " : ""}waiting for next window for endPoint: ${endPoint} (in: ${waitMillis / 1000}s) (at: ${new Date(now.getTime() + waitMillis)}) ${JSON.stringify(limit)}`);
                    }
                    await delay(waitMillis);
                }
                limit = await this._updateRateLimitFromTwitter(endPoint);

                if (limit.remaining >= threshold && this._sleepAfterNewWindow) {
                    await delay(this._sleepAfterNewWindow);
                }
            }
            if (beforeRelease) {
                beforeRelease();
            }
        } finally {
            this._locks.get(endPoint).release();
        }
    }

    /** @private */
    _getRateLimitMap() {
        return this._rateLimit;
    }

    /** @private */
    _getRateLimit(endPoint) {
        return this._getRateLimitMap().get(endPoint);
    }

    /**
     * Update the rateLimit if the passed in limit is more recent than the current one (if present)
     * @param endPoint
     * @param limit
     * @returns {Object} the latest rateLimit
     * @private
     */
    _setRateLimitIfLatest(endPoint, limit) {
        limit = {
            limit: parseInt(limit.limit),
            remaining: parseInt(limit.remaining),
            reset: parseInt(limit.reset),
            lastRequestMs: limit.lastRequestMs,
            origin: limit.origin
        };

        /* twitter sometimes don't send a ratelimit, see the api description */
        if (isNaN(limit.limit)) {
            return this._getRateLimit(endPoint);
        }

        let limitMap = this._getRateLimitMap();
        if (!limitMap.has(endPoint)) {
            limitMap.set(endPoint, limit);
        } else {
            let currentLimit = this._getRateLimit(endPoint);
            if (limit.reset === currentLimit.reset) {
                if (limit.remaining < currentLimit.remaining) {
                    _.merge(currentLimit, limit);
                }
            } else if (limit.reset > currentLimit.reset) {
                _.merge(currentLimit, limit);
            }
            if (currentLimit.lastRequestMs < limit.lastRequestMs) {
                currentLimit.lastRequestMs = limit.lastRequestMs;
            }
        }
        return this._getRateLimit(endPoint);
    }

    /** @private */
    async _updateRateLimitFromTwitter(endPoint) {
        // TODO the api 2.0 does not support this yet, fix when they do
        // ENABLE console.log message below again when working

        /*let resourceName = endPoint.split('/')[0];
        let limitResponse = await this.#twitter.get('application/rate_limit_status', {resources: [resourceName]});
        let resourceGroup = limitResponse.data.resources[resourceName];*/

        let limit = null;
        let twitterLimit = null; // is this even used? the one below is local to the loop

        /*for (let propName in resourceGroup) {
            if (propName == `/${endPoint}`) {
                let twitterLimit = resourceGroup[propName];
                if (twitterLimit.limit) {
                    limit = twitterLimit;
                    limit.origin = rateLimitOrigin.TWITTER;
                    limit.lastRequestMs = Date.now();
                }
                break;
            }
        }*/

        if (!limit) {
            limit = this._getDefaultRuntimeRateLimit(endPoint); //fallback if twitter doesn't send proper values
            //console.log(`${__filename} using default rate limit for ${endPoint}, twitter returned bad data: ${twitterLimit}`);
        }

        limit = this._setRateLimitIfLatest(endPoint, limit);
        return limit;
    }

    /** @private */
    _getDefaultRateLimit(endPoint) {
        let defaultLimit = DEFAULT_APP_RATE_LIMITS.get(endPoint);
        if(!defaultLimit) {
            console.error(`${__filename} unknown endpoint ${endPoint} in DEFAULT_RATE_LIMITS`);
            defaultLimit = {limit: 15, remaining: 15}; //low fallback limit
        }
        return defaultLimit;
    }

    /** @private */
    _getDefaultRuntimeRateLimit(endPoint) {
        let defaultLimit = this._getDefaultRateLimit(endPoint);
        let result =_.cloneDeep(defaultLimit);
        result.reset = Math.trunc((new Date()).getTime() / 1000) + (15 * 60); //15 minutes from now
        result.lastRequestMs = 0;
        result.origin = rateLimitOrigin.LOCAL;
        return result;
    }

};

module.exports = { TwitterRateLimiter };