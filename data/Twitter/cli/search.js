require('../configure-http-agents'); // set timeout to 5min

const cli = require('commander');
const fs = require('fs');
const { TwitterScraper } = require('../model/twitter-scraper');

const optDesc = {
    apiCredentials: `The twitter API consumerKey and consumerSecret as a string in the format KEY:SECRET or a file containing KEY:SECRET`,
    query: `The twitter search query in the format https://developer.twitter.com/en/docs/twitter-api/tweets/search/integrate/build-a-query`,
    dest: `The directory where the result should be stored`,
    filename: `The name of the result file`,
    from: `The date to fetch data from in the format "yyyy-mm-dd" or a timestamp in ms`,
    to: `The date to fetch data to (included) in the format "yyyy-mm-dd" or a timestamp in ms. To fetch a single day this should be the same as "from"`,
    developmentMode: `Should logging data be printed to the stdout`
};

async function run() {

    try {
        cli.requiredOption('-k, --api-credentials <apiCredentials>', optDesc.apiCredentials);
        cli.requiredOption('-q, --query <query>', optDesc.query);
        cli.requiredOption('-d, --destination <directory>', optDesc.dest);
        cli.option('-p, --filename <string>', optDesc.filename, 'tweets_${from}_${to}');
        cli.requiredOption('-f, --from <date>', optDesc.from);
        cli.requiredOption('-t, --to <date>', optDesc.to);
        cli.option('-z, --development-mode', optDesc.developmentMode);

        cli.parse(process.argv);
        let options = cli.opts();

        let credentialsStr = options.apiCredentials;
        let query = options.query;
        let destDir = options.destination;
        let filename = options.filenamePrefix;
        let from = options.from;
        let to = options.to;
        let developmentMode = options.developmentMode;

        if (developmentMode) {
            process.env.NODE_ENV = "development";
        } else if (!process.env.NODE_ENV) {
            process.env.NODE_ENV = "production";
        }

        if (fs.existsSync(credentialsStr)) {
            credentialsStr = fs.readFileSync(credentialsStr, 'utf8');
        }
        credentialsStr = credentialsStr.trim();
        let credentials = credentialsStr.split(':');
        let consumerKey = credentials[0];
        let consumerSecret = credentials[1];

        if (filename.trim() === "") {
            filename = `tweets_${from}_${to}`;
        }

        if (!isNaN(from)) {
            from = Number(from);
        }
        if (!isNaN(to)) {
            to = Number(to);
        }

        let ts = new TwitterScraper(destDir, consumerKey, consumerSecret);
        await ts.init();
        await ts.fetch(filename, query, from, to);

    } catch(e) {
        console.error(e);
    }
}

run();