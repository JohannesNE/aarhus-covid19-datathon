# Twitter Academic Search
A tool for using the twitter v2 api

## Installation
- Install [node.js](https://nodejs.org/en/download/) version 16.x or higher
- Clone this repository
- Navigate to the root of the repository and run
```
$ npm install
```

## Usage 
Navigate to the `./cli` of the repository and run one of the following 
depending on what you want to do (will display the help manual).
```
$ node search -h 
```
```
$ node conversations -h 
```
```
$ node hydrate -h 
```
### Search
Search the full twitter history using the twitter [query language](https://developer.twitter.com/en/docs/twitter-api/tweets/search/integrate/build-a-query).

#### CLI options
- **`-k, --api-credentials <apiCredentials>`** [required] - The twitter API consumerKey and consumerSecret as a string in the format KEY:SECRET or a file containing KEY:SECRET
- **`-q, --query <query>`** [required] - The twitter search query in the twitter [query language](https://developer.twitter.com/en/docs/twitter-api/tweets/search/integrate/build-a-query)
- **`-d, --destination <directory>`** [required] - The directory where the result should be stored
- **`-p, filename <string>`** [optional] - The name of the result file
- **`-f, --from <date>`** [required] - The date to fetch data from in the format "yyyy-mm-dd" or a timestamp in ms
- **`-t, --to <date>`** [required] - The date to fetch data to (included) in the format "yyyy-mm-dd". To fetch a single day this should be the same as "from" or a timestamp in ms
- **`-z, --development-mode`** [optional] - Should logging data be printed to the stdout

#### Example
```
$ node search -k KEY:SECRET -q "war OR peace" -d "/data/twitter" -p "war_peace" -f "2020-10-10" -t "2021-01-01"
```

### Conversations
Fetch full conversations based on a conversation id.

#### CLI options
- **`-k, --api-credentials <apiCredentials>`** [required] - The twitter API consumerKey and consumerSecret as a string in the format KEY:SECRET or a file containing KEY:SECRET
- **`-i, --ids <string|path>`** [required] - A comma separated list of ids ("123,345,678") or a path to a file with ids - one id pr. line
- **`-d, --destination <directory>`** [required] - The directory where the result should be stored
- **`-f, --from <date>`** [required] - The date to fetch data from in the format "yyyy-mm-dd" or a timestamp in ms
- **`-t, --to <date>`** [required] - The date to fetch data to (included) in the format "yyyy-mm-dd". To fetch a single day this should be the same as "from" or a timestamp in ms
- **`-z, --development-mode`** [optional] - Should logging data be printed to the stdout

#### Example
```
$ node conversations -k KEY:SECRET -i "1234,3444" -d "/data/twitter" -f "2020-10-10" -t "2021-01-01"
```

### Hydrate
Hydrate a list of tweet id's to their full json-form.

#### CLI options
- **`-k, --api-credentials <apiCredentials>`** [required] - The twitter API consumerKey and consumerSecret as a string in the format KEY:SECRET or a file containing KEY:SECRET
- **`-i, --ids <string|path>`** [required] - A comma separated list of ids ("123,345,678") or a path to a file with ids - one id pr. line
- **`-d, --destination <directory>`** [required] - The directory where the result should be stored
- **`-p, --filename <string>`** [required] - The name of the result file
- **`-z, --development-mode`** [optional] - Should logging data be printed to the stdout

#### Example
```
$ node conversations -k KEY:SECRET -i "1234,3444" -d "/data/twitter" -p "corona-tweets"
```

#### Hint
For large sets of id's it is advisable to split the list into smaller chunks of e.g. 100.000 id's 
pr. file or even smaller. Then if something goes wrong (the v2 of the API i sometimes unstable) it
is easier to just start over instead figuring out where to resume from. Furtermore this approach makes
it possible to use multiple access tokens for faster hydration - just start a fetch for every
access token available and divide the id's between them. 
