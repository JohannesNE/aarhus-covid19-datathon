require('../configure-http-agents'); // set timeout to 5min

const cli = require('commander');
const fs = require('fs');
const { TwitterScraper } = require('../model/twitter-scraper');


const optDesc = {
    apiCredentials: `The twitter API consumerKey and consumerSecret as a string in the format KEY:SECRET or a file containing KEY:SECRET`,
    ids: `A comma separated list of ids ("123,345,678") or a path to a file with ids - one id pr. line`,
    dest: `The directory where the conversations should be stored`,
    from: `The date to fetch data from in the format "yyyy-mm-dd" or a timestamp in ms`,
    to: `The date to fetch data to (included) in the format "yyyy-mm-dd" or a timestamp in ms. To fetch a single day this should be the same as "from"`,
    developmentMode: `Should logging data be printed to the stdout`
};

async function run() {

    try {
        cli.requiredOption('-k, --api-credentials <apiCredentials>', optDesc.apiCredentials);
        cli.requiredOption('-i, --ids <string|path>', optDesc.ids);
        cli.requiredOption('-d, --destination <directory>', optDesc.dest);
        cli.requiredOption('-f, --from <date>', optDesc.from);
        cli.requiredOption('-t, --to <date>', optDesc.to);
        cli.option('-z, --development-mode', optDesc.developmentMode);

        cli.parse(process.argv);
        let options = cli.opts();

        let credentialsStr = options.apiCredentials;
        let idsStr = options.ids;
        let destDir = options.destination;
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

        let ids;
        if (fs.existsSync(ids)) {
            let content = fs.readFileSync(ids);
            ids = content.split(/\r?\n/);
        } else {
            ids = idsStr.split(',');
        }
        ids = ids.map((id) => id.trim());
        ids = ids.filter((id) => id.length > 0);

        if (!isNaN(from)) {
            from = Number(from);
        }
        if (!isNaN(to)) {
            to = Number(to);
        }

        let ts = new TwitterScraper(destDir, consumerKey, consumerSecret);
        await ts.init();
        await ts.fetchConversations(ids, from, to);

    } catch(e) {
        console.error(e);
    }
}

run();