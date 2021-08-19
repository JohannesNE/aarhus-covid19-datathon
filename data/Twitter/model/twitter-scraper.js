const { TwitterClient } = require('./twitter-client');
const { TwitterRateLimiter } = require('./twitter-rate-limiter');
const { DateTime } = require('luxon');
const fs = require('fs');
const _ = require('lodash');
const path = require('path');
const delay = require('delay');
const lineByLine = require('n-readlines');  // OBS synchronous, don't use in high performance app

/**
 * - children's "path" and "valuePath" must be relative to their parent-object and NOT to the tweet itself. See
 *   "referenced_tweets.id" and "referenced_tweets.id.author_id" for an example.
 */
const EXPANSION_FIELDS_INFO = [
    { expansionPath: 'attachments.poll_ids', isArray: true,  path: 'attachments.poll_ids', valuePath: '', targetMap: 'polls', tweetDestinationProperty: 'polls' },
    { expansionPath: 'attachments.media_keys', isArray: true,  path: 'attachments.media_keys', valuePath: '', targetMap: 'media', tweetDestinationProperty: 'media' },
    { expansionPath: 'author_id', isArray: false, path: 'author_id', targetMap: 'usersById', tweetDestinationProperty: 'users' },
    { expansionPath: 'entities.mentions.username', isArray: true,  path: 'entities.mentions', valuePath: 'username', targetMap: 'usersByUsername', tweetDestinationProperty: 'users' },
    { expansionPath: 'geo.place_id', isArray: false, path: 'geo.place_id', targetMap: 'places', tweetDestinationProperty: 'places' },
    { expansionPath: 'in_reply_to_user_id', isArray: false, path: 'in_reply_to_user_id', targetMap: 'usersById', tweetDestinationProperty: 'users' },
    { expansionPath: 'referenced_tweets.id', isArray: true,  path: 'referenced_tweets', valuePath: 'id', targetMap: 'tweets', tweetDestinationProperty: 'tweets',
        children: [{ expansionPath: 'referenced_tweets.id.author_id', isArray: false, path: 'author_id', targetMap: 'usersById', tweetDestinationProperty: 'users' }]
    },
];

const QUERY_EXTRA_FIELDS = Object.freeze({
    'expansions': ['attachments.poll_ids', 'attachments.media_keys', 'author_id', 'entities.mentions.username', 'geo.place_id',
        'in_reply_to_user_id', 'referenced_tweets.id', 'referenced_tweets.id.author_id'].join(','),
    'media.fields': ['duration_ms', 'height', 'media_key', 'preview_image_url', 'type', 'url', 'width', 'public_metrics'].join(','),
    'place.fields': ['contained_within', 'country', 'country_code', 'full_name', 'geo', 'id', 'name', 'place_type'].join(','),
    'poll.fields': ['duration_minutes', 'end_datetime', 'id', 'options', 'voting_status'].join(','),
    'tweet.fields': ['attachments', 'author_id', 'context_annotations', 'conversation_id', 'created_at', 'entities', 'geo', 'id',
        'in_reply_to_user_id', 'lang', 'public_metrics', 'possibly_sensitive', 'referenced_tweets', 'reply_settings', 'source', 'text', 'withheld'].join(','),
    'user.fields': ['created_at', 'description', 'entities', 'id', 'location', 'name', 'pinned_tweet_id', 'profile_image_url',
        'protected', 'public_metrics', 'url', 'username', 'verified', 'withheld'].join(','),
});

/**
 * query examples: https://developer.twitter.com/en/docs/twitter-api/tweets/search/integrate/build-a-query
 *
 */
class TwitterScraper {

    #consumerKey;
    #consumerSecret;
    #destDir;
    #twitter;
    #rateLimiter;
    #pageSizeTemp;

    /**
     *
     * @param destDir
     * @param consumerKeyOrBearerToken the consumerKey or bearerToken to use, if consumerSecret is undefined this i considered af bearerToken
     * @param consumerSecret
     */
    constructor(destDir, consumerKeyOrBearerToken, consumerSecret, pageSizeTemp) {
        this.#destDir = destDir;
        this.#pageSizeTemp = pageSizeTemp ?? 500;
        if (!consumerSecret) {
            this._init(consumerKeyOrBearerToken);
        } else {
            this.#consumerKey = consumerKeyOrBearerToken;
            this.#consumerSecret = consumerSecret;
        }
    }

    async init() {
        if (!this.#twitter) {
            let bearerToken = await TwitterClient.getBearerToken(this.#consumerKey, this.#consumerSecret);
            this._init(bearerToken);
        }
    }

    _init(bearerToken) {
        this.#twitter = new TwitterClient({
            bearerToken
        });
        this.#rateLimiter = new TwitterRateLimiter(this.#twitter, "rate-limiter-0");
    }

    /**
     *
     * @param {string} filename the name of the file
     * @param {string} query a twitter query in the following format https://developer.twitter.com/en/docs/twitter-api/tweets/search/integrate/build-a-query
     * @param {string|number} from a date in the format YYYY-MM-DD or a timestamp in millis
     * @param {string|number} to a date in the format YYYY-MM-DD or a timestamp in millis
     * @param {string} [resumeNextToken] the token to resume from
     * @return {Promise<void>}
     */
    async fetch(filename, query, from, to, resumeNextToken) {
        this._testInit();
        let filePath = path.join(this.#destDir, `${filename}.ndjson`);

        let fileHandle;

        let endPoint = 'tweets/search/all';
        let queryParams;

        try {
            fs.mkdirSync(this.#destDir, { recursive: true });

            let fromDate = this._parseUserDate(from);
            let userToDate = this._parseUserDate(to);
            let toDate = userToDate.plus({days: 1});  //make it utc and add one day (end timestamp not included in twitter api)

            fileHandle = fs.openSync(filePath, resumeNextToken ? 'a' : 'w');

            let fromTimestamp = this._dateToTwitterTimeStamp(fromDate);
            let toTimestamp = this._dateToTwitterTimeStamp(toDate);

            let next = resumeNextToken;
            let pageCount = 0;
            let tweetCount = 0;
            let response;


            do {
                // https://developer.twitter.com/en/docs/twitter-api/tweets/search/api-reference/get-tweets-search-all
                queryParams = {
                    max_results: this.#pageSizeTemp, //500, // change temporary to 100 to fix 503 errror, until bug fixed
                    end_time: toTimestamp,
                    start_time: fromTimestamp,
                    query: query,
                    ... QUERY_EXTRA_FIELDS
                };
                if (next) {
                    queryParams.next_token = next;
                }

                response = await this._doTwitterRequest(endPoint, queryParams);
                next = response.meta.next_token;

                if (response.meta.result_count > 0) {
                    this._remapResponse(response);
                    for (let tweet of response.data) {
                        fs.writeSync(fileHandle, JSON.stringify(tweet) + "\n");
                        tweetCount++;
                    }
                }
                pageCount++;
            } while (next);
            if (process.env.NODE_ENV === "development") {
                console.log(`Fetch done. Fetched ${tweetCount} tweets.`);
            }
            // maybe implement retry on ratelimits, because we cannot get the same info from twitter as with v1.1
            // see https://www.npmjs.com/package/twitter-lite#rate-limiting for error code test
        } catch (e) {
            console.error(`Error for ${endPoint} with params: ${JSON.stringify(queryParams, null, 2)}`);
            console.error(e);
        } finally {
            if (fileHandle) {
                fs.closeSync(fileHandle);
            }
        }
    }

    /**
     * @param conversationIds
     * @return {Promise<void>}
     */
    async fetchConversations(conversationIds, from, to) {
        this._testInit();

        let endPoint = 'tweets/search/all';

        fs.mkdirSync(this.#destDir, { recursive: true });

        let fromDate = DateTime.fromFormat(from, 'yyyy-MM-dd', {zone: 'utc'}); // make it utc
        let userToDate = DateTime.fromFormat(to, 'yyyy-MM-dd', {zone: 'utc'});
        let toDate = userToDate.plus({days: 1});  //make it utc and add one day (end timestamp not included in twitter api)

        let fromTimestamp = this._dateToTwitterTimeStamp(fromDate);
        let toTimestamp = this._dateToTwitterTimeStamp(toDate);

        for (let conversationId of conversationIds) {
            let filePath = path.join(this.#destDir, `conversation-${conversationId}_${from}_${to}.ndjson`);
            let fileHandle;

            let response;
            let next;

            try {
                fileHandle = fs.openSync(filePath, 'w');
                do {
                    let queryParams = {
                        max_results: 500,
                        end_time: toTimestamp,
                        start_time: fromTimestamp,
                        query: `conversation_id:${conversationId}`,
                        ... QUERY_EXTRA_FIELDS
                    };

                    if (next) {
                        queryParams.next_token = next;
                    }

                    response = await this._doTwitterRequest(endPoint, queryParams);
                    next = response.meta.next_token;

                    if (response.meta.result_count > 0) {
                        this._remapResponse(response);
                        for (let tweet of response.data) {
                            fs.writeSync(fileHandle, JSON.stringify(tweet) + "\n");
                        }
                    }
                } while (next);
            } catch (e) {
                console.error(e);
            }finally {
                if (fileHandle) {
                    fs.closeSync(fileHandle);
                }
            }
        }
    }

    async fetchRetweets(originalTweetId) {
        this._testInit();
        let filePath = path.join(this.#destDir, `${originalTweetId}-retweets.ndjson`);

        let fileHandle;

        let endPoint = 'tweets/search/all';
        let tweetLookupEndPoint = "tweets";
        let queryParams;

        try {
            fs.mkdirSync(this.#destDir, { recursive: true });

            let tweetQueryParams = {
                ids: originalTweetId,
                ...QUERY_EXTRA_FIELDS
            };

            let tweetLookupResponse = await this._doTwitterRequest(tweetLookupEndPoint, tweetQueryParams);

            let tweet = tweetLookupResponse.data[0];
            if (!tweet) {
                throw new Error(`No tweet could be found for: '${originalTweetId}'`);
            }

            let fromTimestamp = tweet.created_at;

            fileHandle = fs.openSync(filePath, 'w');

            let response;
            let next;
            let pageCount = 0;
            let tweetCount = 0;

            // TODO should we truncate text to take RT into account?
            let textTruncated = tweet.text;
            if (textTruncated.length > 100) {
                textTruncated = textTruncated.substr(0, 100);
                textTruncated = textTruncated.substr(0, textTruncated.lastIndexOf(" "));
            }
            let query = `retweets_of:${tweet.author_id} "${textTruncated}"`;

            do {
                // https://developer.twitter.com/en/docs/twitter-api/tweets/search/api-reference/get-tweets-search-all
                queryParams = {
                    max_results: this.#pageSizeTemp, //500, // change temporary to 100 to fix 503 errror, until bug fixed
                    start_time: fromTimestamp,
                    query: query,
                    ... QUERY_EXTRA_FIELDS
                };
                if (next) {
                    queryParams.next_token = next;
                }

                response = await this._doTwitterRequest(endPoint, queryParams);
                next = response.meta.next_token;

                if (response.meta.result_count > 0) {
                    this._remapResponse(response);
                    for (let tweet of response.data) {
                        for (let refTweet of tweet.referenced_tweets) {
                            if (refTweet.id === originalTweetId) {
                                fs.writeSync(fileHandle, JSON.stringify(tweet) + "\n");
                                tweetCount++;
                                break;
                            }
                        }
                    }
                }
                pageCount++;
            } while (next);
            if (process.env.NODE_ENV === "development") {
                console.log(`Fetch done. Fetched ${tweetCount} tweets.`);
            }
            // maybe implement retry on ratelimits, because we cannot get the same info from twitter as with v1.1
            // see https://www.npmjs.com/package/twitter-lite#rate-limiting for error code test
        } catch (e) {
            console.error(`Error for ${endPoint} with params: ${JSON.stringify(queryParams, null, 2)}`);
            console.error(e);
            console.error(e?.twitterError?.errors)
        } finally {
            if (fileHandle) {
                fs.closeSync(fileHandle);
            }
        }
    }

    /**
     *
     * @param filename
     * @param ids an array of ids or a path to a file containing the ids
     * @return {Promise<void>}
     */
    async lookupTweets(filename, ids) {
        this._testInit();

        let endPoint = 'tweets';

        fs.mkdirSync(this.#destDir, { recursive: true });
        let filePath = path.join(this.#destDir, `${filename}.ndjson`);
        let fileHandle;

        try {
            if (fs.existsSync(ids)) {
                ids = fs.readFileSync(ids, 'utf8').trim().split(/\r?\n/);
            }

            fileHandle  = fs.openSync(filePath, 'w');

            for (let chunk of _.chunk(ids, 100)) {

                let queryParams = {
                    ids: chunk.join(','),
                    ...QUERY_EXTRA_FIELDS
                };

                let response = await this._doTwitterRequest(endPoint, queryParams);

                if (response.data) {
                    this._remapResponse(response);
                    for (let tweet of response.data) {
                        fs.writeSync(fileHandle, JSON.stringify(tweet) + "\n");
                    }
                }

            }

        } catch (e) {
            console.error(e);
        }finally {
            if (fileHandle) {
                fs.closeSync(fileHandle);
            }
        }
    }

    async extractConversationIds(srcFilePath, destFile) {
        const liner = new lineByLine(srcFilePath);
        let fileHandle;

        try {
            fileHandle = fs.openSync(path.join(this.#destDir, destFile), 'w');
            let line;
            while (line = liner.next()) {
                line = line.toString();
                if (line.trim().length === 0) {
                    continue;
                }
                let tweet = JSON.parse(line);
                fs.writeSync(fileHandle, tweet.conversation_id + "\n");
            }
        } catch (e) {
            console.error(e);
        } finally {
            if (fileHandle) {
                fs.closeSync(fileHandle);
            }
        }
    }

    _dateToTwitterTimeStamp(date) {
        return date.toFormat(`yyyy-MM-dd'T'HH:mm:ss'Z'`);
    }

    _parseUserDate(date) {
        let result;
        if (_.isNumber(date)) {
            result = DateTime.fromMillis(date, {zone: 'utc'}); // make it utc
        } else {
            result = DateTime.fromFormat(date, 'yyyy-MM-dd', {zone: 'utc'}); // make it utc
        }
        return result;
    }

    async _doTwitterRequest(endPoint, queryParams) {
        let retryCount = 0;
        while (true) {
            try {
                await this.#rateLimiter.waitForOpenWindow(endPoint, () => {
                    this.#rateLimiter.decrementRateLimit(endPoint);
                });

                let response = await this.#twitter.get(endPoint, queryParams);
                this.#rateLimiter.setRateLimitFromResponseHeader(endPoint, new Map(Object.entries(response.headers)));
                let twitterResponse = JSON.parse(response.body);
                return twitterResponse;
            } catch (e) {
                retryCount++;
                let status = e?.response?.statusCode ?? 100000;
                // hmm seems to be just a twitter glitch, there is still a lot remaining when this is thrown???
                if (status === 429) { // TODO TEMP remove again when found out if just twitter abnormality
                    this.#rateLimiter.setRateLimitFromResponseHeader(endPoint, queryParams); // try to set it again
                    console.log('x-rate-limit-limit', e.response.headers['x-rate-limit-limit']);
                    console.log('x-rate-limit-remaining', e.response.headers['x-rate-limit-remaining']);
                    console.log('x-rate-limit-reset', e.response.headers['x-rate-limit-reset']);
                } // END TEMP
                // sometimes twitter throws a 429 even though we obey the described limits
                // We are actually doing double retries because GOT i also doing retries, but that is fine (maybe only handle 503) // https://github.com/sindresorhus/got#retry
                // it seems that GOT i taken care of the other errors fine, but 503 needs longer waits...
                if (retryCount > 2 || (status < 500 && status !== 429) || (status === 100000 && !['ECONNRESET'].includes(e.code))) {
                    throw e;
                } else {
                    if (process.env.NODE_ENV === "development") {
                        console.log(`Retrying request because of status: ${status}, code: ${e.code}`);
                    }
                    let baseDelay = 5000;
                    if (status === 503) {
                        baseDelay *= 5; // wait longer when we have a service unavailable
                    }
                    await delay(baseDelay * ((retryCount ** 2) + 1));
                }

            }
        }

    }

    /**
     * re-map response includes and errors so they are copied to the individual tweets, so each tweet is fully self contained
     * @param response the twitter response
     * @private
     */
    _remapResponse(response) {
        let includeMappings = {
            media: this._getIncludeMapping(response, 'includes.media', 'media_key'),
            usersById: this._getIncludeMapping(response, 'includes.users', 'id'),
            usersByUsername: this._getIncludeMapping(response, 'includes.users', 'username'),
            tweets: this._getIncludeMapping(response, 'includes.tweets', 'id'),
            places: this._getIncludeMapping(response, 'includes.places', 'id'),
            polls: this._getIncludeMapping(response, 'includes.polls', 'id'),
        };
        let errorMappings = this._getErrorMappings(response);

        let lookup = {
            includeMappings,
            errorMappings,
        };

        for (let tweet of response.data) {
            let expansion = this._getIncludesAndErrorsForTweet(tweet, lookup);
            tweet.errors = expansion.errors;
            tweet.includes = expansion.includes;
        }
    }


    _getIncludeMapping(response, path, key) {
        let mapping = new Map();
        let entries = _.get(response, path);
        if (entries) {
            for (let entry of entries) {
                mapping.set(entry[key], entry);
            }
        }
        return mapping;
    }

    _getErrorMappings(response) {
        let mappings = new Map();
        let errors = response.errors;
        if (errors) {
            for (let error of errors) {
                let parameterMap = mappings.get(error.parameter);
                if (!parameterMap) {
                    parameterMap = new Map();
                    mappings.set(error.parameter, parameterMap);
                }
                parameterMap.set(error.value, error);
            }
        }
        return mappings;
    }

    _getIncludesAndErrorsForTweet(tweet, lookup) {
        let tmpResult = {
            destPropertySets: {},
            errors: []
        };

        for (let propertyInfo of EXPANSION_FIELDS_INFO) {
            let property = _.get(tweet, propertyInfo.path);
            if (property === undefined) {
                continue;
            }

            let ids = this._getPropertyIdsForTweetOrInclude(tweet, propertyInfo);
            this._addIncludesForProperty(ids, propertyInfo, lookup, tmpResult);
        }

        let includes = {};
        for (let prop of Object.getOwnPropertyNames(tmpResult.destPropertySets)) {
            let set = tmpResult.destPropertySets[prop];
            if (set.size > 0) {
                includes[prop] = Array.from(set); // convert to array
            }
        }
        return {
            includes,
            errors: tmpResult.errors
        };
    }

    _getPropertyIdsForTweetOrInclude(tweetOrInclude, propertyInfo) {
        let property = _.get(tweetOrInclude, propertyInfo.path);
        let ids = [];
        if (property === undefined) {
            return ids;
        }
        if (propertyInfo.isArray) {
            for (let entry of property) {
                if (propertyInfo.valuePath) {
                    ids.push(entry[propertyInfo.valuePath]);
                } else {
                    ids.push(entry);
                }
            }
        } else {
            ids.push(property);
        }
        return ids;
    }

    _addIncludesForProperty(ids, propertyInfo, lookup, result) {
        if (ids.length === 0) {
            return;
        }

        let destinationSet = result.destPropertySets[propertyInfo.tweetDestinationProperty];
        if (!destinationSet) {
            destinationSet = new Set();
            result.destPropertySets[propertyInfo.tweetDestinationProperty] = destinationSet;
        }

        for (let id of ids) {
            let object = lookup.includeMappings[propertyInfo.targetMap].get(id);
            if (object) { // if object is not present there will be info about why in the error mapping below
                destinationSet.add(object);
                if (propertyInfo.children) {
                    for (let childPropertyInfo of propertyInfo.children) {
                        let childIds = this._getPropertyIdsForTweetOrInclude(object, childPropertyInfo);
                        this._addIncludesForProperty(childIds, childPropertyInfo, lookup, result);
                    }
                }
            } else {
                let error = lookup.errorMappings.get(propertyInfo.expansionPath)?.get(id); // some time no error is present even if something is missing
                if (error) {
                    result.errors.push(error);
                } else {
                    if ( process.env.NODE_ENV === 'development') {
                        console.warn(`No error info for id: "${id}" for expansionPath: "${propertyInfo.expansionPath}"`);
                    }
                }
            }
        }
    }

    _testInit() {
        if (!this.#twitter) {
            throw new Error('Call "await twitterScraper.init() before using this method or pass in a bearer-token to the constructor instead of consumerKey + consumerSecret"');
        }
    }

}

module.exports = { TwitterScraper };
