const OAuth = require('oauth-1.0a');
const querystring = require('querystring');
const got = require('got');

/*
* Heavily inspired by https://www.npmjs.com/package/twitter-lite and created first and foremost
* to better handle instabillity in the twitter API where a connection could close after headers is received.
* This is done by replacing the node-fetch http-module with GOT
* the release of node-fetch 3.x should also handle errors better
* */

const baseUrl = "https://api.twitter.com/2/";

class TwitterClient {

    #options;
    #authType;
    #isAppAccess;
    #oauthClient;
    #userToken;

    /**
     *
     * @param {object} options
     * @param {string} options.bearerToken
     * @param {object} options.consumerKey
     * @param {string} options.consumerSecret
     * @param {string} options.accessTokenKey
     * @param {string} options.accessTokenSecret
     *
     */
    constructor(options) {
        this.#options = options; // do some validation at some point
        this.#isAppAccess = options.bearerToken !== undefined;
        this.#authType = this.#isAppAccess ? "App" : "User";
        this.#oauthClient = TwitterClient.createOauthClient({
            key: options.consumerKey,
            secret: options.consumerSecret,
        });
        this.#userToken = {
            key: options.accessTokenKey,
            secret: options.accessTokenSecret
        }
    }

    get authType() {
        return this.#authType;
    }

    async get(endPoint, params) {
        let headers = {};
        this.#authorizeRequestHeader(headers, params);
        return TwitterClient.#doRequest('GET', `${baseUrl}${endPoint}`, headers, params);
    }

    async post(endPoint, params) {
        let headers = {
            "Content-Type": 'application/x-www-form-urlencoded;charset=UTF-8'
        };
        this.#authorizeRequestHeader(headers, params);
        let body = oAuthUrlEncode(params);
        return TwitterClient.#doRequest('POST', `${baseUrl}${endPoint}`, headers, undefined, body);
    }

    #authorizeRequestHeader(headers, queryParams) {
        // sign the request and set headers
        if (this.#isAppAccess) {
            headers['Authorization'] = `Bearer ${this.#options.bearerToken}`;
        } else {
            Object.assign(headers, this.#oauthClient.toHeader(this.#oauthClient.authorize(queryParams, this.#userToken)));
        }
    }

    static async #doRequest(method, url, headers, queryParams, body) {
        let response;
        try {
            response = await got(url, {
                method,
                headers,
                searchParams: queryParams,
                body
            });
        } catch (e) {
            if (e instanceof got.HTTPError) {
                // got does not make an detailed enough stack trace https://github.com/sindresorhus/got/issues/1077
                let stack = {};
                Error.captureStackTrace(stack);
                e.stack += `\n${stack.stack.replace('Error\n', '')}`;
                try {
                    let twitterError = JSON.parse(e?.response?.body);
                    e.twitterError = twitterError;
                } catch (e2) {
                    if (process.env.NODE_ENV === "development") {
                        console.log(e2);
                    }
                }
            }
            throw e;
        }
        return response;

    }

    static async getBearerToken(consumerKey, consumerSecret) {
        // https://developer.twitter.com/en/docs/authentication/oauth-2-0/application-only
        let headers = {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
            'Authorization': `Basic ${Buffer.from(`${oAuthUrlEncode(consumerKey)}:${oAuthUrlEncode(consumerSecret)}`).toString('base64')}`
        };
        let body = 'grant_type=client_credentials';
        let response = await TwitterClient.#doRequest('POST', 'https://api.twitter.com/oauth2/token', headers, {}, body);
        let payload = JSON.parse(response.body);
        return payload.access_token;

    }

    static createOauthClient(key, secret) {
        const client = OAuth({
            consumer: { key, secret },
            signature_method: 'HMAC-SHA1',
            hash_function(baseString, key) {
                return crypto
                    .createHmac('sha1', key)
                    .update(baseString)
                    .digest('base64');
            },
        });

        return client;
    }
}

/*
* Use this for encoding the body in signed POST request to be compliant with how OAuth encode data
* */
function oAuthUrlEncode(stringOrObject) {
    let string;
    if (typeof stringOrObject === 'object') {
        string = querystring.stringify(stringOrObject);
    } else {
        string = stringOrObject;
    }
    return querystring.escape(string)
        // additional encoding to be rfc-1738 compliant https://locutus.io/php/url/rawurlencode/
        // and encode the same way as OAuth
        .replace(/!/g, '%21')
        .replace(/\*/g, '%2A')
        .replace(/'/g, '%27')
        .replace(/\(/g, '%28')
        .replace(/\)/g, '%29');
}

module.exports = { TwitterClient };

// test
/*
async function test() {
    try {
        let bearerToken = await TwitterClient.getBearerToken('INxb3675f0VUk1hY57rtAMgpn', '6bzAJAF92WoPG1GdQdeqQHOcpJX4uiBB8asz9uc55DomDzwEat');
        bearerToken += "d"
        let tw = new TwitterClient({
            bearerToken
        });
        let res = await tw.get('tweets/search/all', {
            query: 'sex'
        });
        console.log(res.body);
    } catch (e) {
        console.log(e.response.statusCode);
    }

}
test();
let tw = new TwitterClient({
    consumerKey: "",
    consumerSecret: ""
})*/

