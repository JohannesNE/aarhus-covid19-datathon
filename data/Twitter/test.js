const fs = require('fs');
require('./configure-http-agents'); // set timeout to 5min

const { TwitterScraper } = require('./model/twitter-scraper');

process.env.NODE_ENV = "development"; // debug messages

/*
* There is a bug with entities.mentions.username when user not exist we get no user info or an user error
* try from:2007-01-01 to:2021-01-01 query: '@badasskiyoko' and enable developer mode and see the log.
* also see the file badasskiyoko_no_errors.json where the is no user and no errors with that name
* bug report: https://twittercommunity.com/t/entities-mentions-username-expansion-does-not-always-return-a-user-or-an-error/150429
* */

async function runHopeSearch() {

    const credentials = require('./credentials').hope;
    const credentialsStr = `${credentials.consumerKey}:${credentials.consumerSecret}`;
    //const query = '"tvangsvaccine" OR "tvangsvacciner" OR "tvangsvaccinationer" OR "tvangsvaccination" OR "tvangstester" OR "tvangstest" OR "tvangsteste" OR "tvangstestning"'//'"epidemiloven" OR "epidemilov"' //'"coronapas"'; //'"mettef" OR  "mettefrederiksen" OR  "mettefredriksen" OR  "#mettef" OR  "#mettefrederiksen" OR  "#mettefredriksen" OR  "mette frederiksen" OR  "mette fredriksen" OR  "mette f" OR  "@statsmin"'//'lang:da (og OR i OR jeg OR det OR at OR en OR den OR til OR er OR som OR på OR de OR med OR han OR af OR for OR ikke OR der OR var OR mig OR sig OR men OR et OR har OR om OR vi OR min OR havde OR ham OR hun OR nu OR over OR da OR fra OR du OR ud OR sin OR dem OR os OR op OR man OR hans OR hvor OR eller OR hvad OR skal OR selv OR her OR alle OR vil OR blev OR kunne OR ind OR når OR være OR dog OR noget OR ville OR jo OR deres OR efter OR ned OR skulle OR denne OR end OR dette OR mit OR også OR under OR have OR dig OR anden OR hende OR mine OR alt OR meget OR sit OR sine OR vor OR mod OR disse OR hvis OR din OR nogle OR hos OR blive OR mange OR ad OR bliver OR hendes OR været OR thi OR jer)';
    //const query = '(lang:no OR lang:sv) (aften OR aldrig OR alltid OR altid OR andet OR arbejde OR bedste OR behöver OR behøver OR beklager OR berätta OR betyr OR blev OR blevet OR blir OR blitt OR blive OR bliver OR bruge OR burde OR bättre OR båe OR bør OR deim OR deires OR ditt OR drar OR drepe OR dykk OR dykkar OR där OR död OR döda OR død OR døde OR efter OR elsker OR endnu OR faen OR fandt OR feil OR fikk OR finner OR flere OR forstår OR fortelle OR fortfarande OR fortsatt OR fortælle OR från OR få OR fået OR får OR fått OR förlåt OR första OR försöker OR før OR først OR første OR gick OR gikk OR gillar OR gjennom OR gjerne OR gjorde OR gjort OR gjør OR gjøre OR godt OR gå OR gång OR går OR göra OR gør OR gøre OR hadde OR hallå OR havde OR hedder OR helt OR helvete OR hende OR hendes OR hennes OR herregud OR hjelp OR hjelpe OR hjem OR hjälp OR hjå OR hjælp OR hjælpe OR honom OR hossen OR hvem OR hvis OR hvordan OR hvorfor OR händer OR här OR håll OR håller OR hør OR høre OR hører OR igjen OR ikkje OR ingenting)';
    //const query = '(lang:no OR lang:sv) (inkje OR inte OR intet OR jeres OR jävla OR kanske OR kanskje OR kender OR kjenner OR korleis OR kvarhelst OR kveld OR kven OR kvifor OR känner OR ledsen OR lenger OR lidt OR livet OR längre OR låt OR låter OR længe OR meget OR menar OR mycket OR mykje OR må OR måde OR många OR mår OR måske OR måste OR måtte OR navn OR nogen OR noget OR nogle OR noko OR nokon OR nokor OR nokre OR någon OR något OR några OR nån OR når OR nåt OR nødt OR också OR også OR pengar OR penger OR pratar OR prøver OR på OR redan OR rundt OR rätt OR sagde OR saker OR samma OR sammen OR selv OR selvfølgelig OR sidan OR sidste OR siger OR sikker OR sikkert OR själv OR skete OR skjedde OR skjer OR skulle OR sluta OR slutt OR snakke OR snakker OR snill OR snälla OR somt OR stadig OR stanna OR sted OR står OR synes OR säger OR sätt OR så OR sådan OR såg OR sånn OR tager OR tiden OR tilbage OR tilbake OR tillbaka OR titta OR trenger OR trodde OR troede OR tror OR två OR tycker OR tänker OR uden OR undskyld)'
    const query = '(lang:no OR lang:sv) (unnskyld OR ursäkta OR uten OR varför OR varit OR varte OR veldig OR venner OR verkligen OR vidste OR vilken OR virkelig OR visste OR väg OR väl OR väldigt OR vän OR vår OR våra OR våre OR væk OR vær OR være OR været OR älskar OR åh OR år OR åt OR över)'
    const dest = 'd:/temp/twitter/hope-academic/tweets';
    const from = '2020-02-01'; // 2007-01-01 for badasskiyoko problem
    const to = '2020-05-27';
    const filenamePrefix = `no_sv_stopwords_part4_${from}_${to}`;
    const resumeToken = undefined;

    let ts = new TwitterScraper(dest, credentials.consumerKey, credentials.consumerSecret, 100);
    await ts.init();

    await ts.fetch(filenamePrefix, query, from, to, resumeToken);

    /*let args = [
        '-k', credentialsStr,
        '-q', query,
        '-d', dest,
        '-p', filenamePrefix,
        '-f', from,
        '-t', to,
        '-z' // developer mode, console.log
    ];

    process.argv.push(...args);

    const cli = require('./search');*/
}

//runHopeSearch();

async function runHopeRetweets() {
    const credentials = require('./credentials').hope;
    const credentialsStr = `${credentials.consumerKey}:${credentials.consumerSecret}`;

    let ts = new TwitterScraper('d:/temp/twitter/twitter-fight/retweets', credentials.consumerKey, credentials.consumerSecret);
    await ts.init();
    //await ts.fetchRetweets('1404569659878395906');
    //await ts.extractConversationIds('D:\\temp\\twitter\\twitter-fight\\retweets\\1404166612219990020-retweets.ndjson', '1404166612219990020-convs-ids.txt');
}

//runHopeRetweets();

async function runHopeConversations() {
    const credentials = require('./credentials').hope;
    const credentialsStr = `${credentials.consumerKey}:${credentials.consumerSecret}`;

    //const tweetIds = fs.readFileSync('d:/temp/twitter/twitter-fight/3_AR.txt', 'utf8').trim().split(/\r?\n/);
    //let ts = new TwitterScraper('d:/temp/twitter/twitter-fight/3_AR', credentials.consumerKey, credentials.consumerSecret);
    //await ts.init();
    //await ts.lookupTweets('3_AR', tweetIds);
    //await ts.extractConversationIds('D:/temp/twitter/twitter-fight/3_AR/3_AR.ndjson', 'conversation-ids.txt');

    const from = '2007-01-01';
    const to = '2021-06-21';

    let ts2 = new TwitterScraper('d:/temp/twitter/twitter-fight/retweets/conversations', credentials.consumerKey, credentials.consumerSecret);
    await ts2.init()
    let conversationsIds = readLines('d:/temp/twitter/twitter-fight/retweets/1404166612219990020-convs-ids.txt');

    await ts2.fetchConversations(conversationsIds, from, to);

    /*
    const dest = 'd:/temp/twitter/hope-academic/top200-convs-dk';

    let args = [
        '-k', credentialsStr,
        '-d', dest,
        '-i', conversationsIds,
        '-f', from,
        '-t', to,
        '-z' // developer mode, console.log
    ];

    process.argv.push(...args);

    const cli = require('./conversations');
    */
}

//runHopeConversations();





async function runChinaSearch() {
    //process.env.NODE_ENV = "development";

    let handles =  [/*"@ChinaEUMission", "@Amb_ChenXu", "@SpokespersonCHN", "@MFA_China", "@zlj517", "@ouzhounews", "@shen_shiwei",
        "@CGTNOfficial", "@XHNews", "@ChinaDaily", "@chenweihua", "@CNS1952", "@PDChinese","@PDChina", "@globaltimesnews",
        "@HuXijin_GT", "@XinWen_Ch", "@QiushiJournal", "@ChinaEmbassyUSA", "@ChineseEmbinUS", "@AmbCuiTiankai",
        "@AmbassadeChine", "@ChinaEmbGermany", "@ambcina", "@ChineseEmbinUK", "@AmbLiuXiaoMing", "@ChinaInDenmark",*/

    /*"@ChinaMissionVie", "@ChinaMissionGva", "@Chinamission2un", "@EUMissionChina", "@chinascio", "@CHN_UN_NY",
    "@ChnMission", "@ChinaAmbUN", "@spokespersonHZM", "@ChinaConsulate", "@consulat_de", "@China_Lyon",
    "@GeneralkonsulDu", "@CCGBelfast", "@chinacgedi"*/
    ];

    /*
     ## mentions done
    @Amb_ChenXu
    @SpokespersonCHN
    @MFA_China
    @zlj517
    @shen_shiwei
    @CGTNOfficial
    @XHNews
    @chenweihua
    @CNS1952
    @PDChinese
    @PDChina
    @globaltimesnews
    @HuXijin_GT
    @XinWen_Ch
    @QiushiJournal
    @ChinaEmbassyUSA
    @ChineseEmbinUS
    @AmbCuiTiankai
    @AmbassadeChine
    @ChinaEmbGermany
    @ambcina
    @ChineseEmbinUK
    @AmbLiuXiaoMing
    @ChinaInDenmark

    ## mentions restart
    @ChinaEUMission


    ## mentions resume
    @PDChina, b26v89c19zqg8o3fo7delfy70p4pksbbzigxilqm5iet9
    @ChineseEmbinUS, b26v89c19zqg8o3fo7ges91j1ccw50rjjkrgxor0t37nh
    *
    * */

    const credentials = require('./credentials').china;
    const dest = 'd:/temp/twitter/china-academic';
    const from = '2007-01-01'; // 2007-01-01 for badasskiyoko problem
    const to = '2021-02-28';

    let ts = new TwitterScraper(dest, credentials.consumerKey, credentials.consumerSecret, 100);

    await ts.init();

    // TODO STOP,
    //console.log('KØR FØRST fetch med de nye konti fra Mette, (tilføj ovenfor og fjern udkommneteret kode og og kommenter ud på mention fetch delen)');

    for (let handle of handles) {
        let handleNoAt = handle.substr(1);
        console.log("fetching: ", handleNoAt)
        // await ts.fetch(`from_${handleNoAt}_${from}_${to}`, `from:${handleNoAt}`, from, to);
        await ts.fetch(`mention_${handleNoAt}_${from}_${to}`, `${handle}`, from, to);
    }
}

// TODO retry on JSON parse error, find ud af hvad den error hedder

// TODO er ved at køre dette men får fejl, har en liste ovensfor hvilke mentions der skal resumes, køres forfra.
// desuden skal listen køres færdig, vi er kommet til den portion som ikke er udkommenteret (kun mentions mangler).
// er også ved at lave en CSV-mapper i corwdtangle projekt og der er også en todo der skal færdiggøres under scraperen
runChinaSearch();

async function fetchCoronaMusicUsers() {
    const credentials = require('./credentials').coronaMusic;
    const dest = 'h:/twitter/corona-music/users';
    const from = '2019-02-01';
    const to = '2019-05-01';

    let userIds = readLines('H:/twitter/corona-music/users/user_ids_controlset.txt');

    let ts = new TwitterScraper(dest, credentials.bearerToken, undefined, 100);
    await ts.init();

    for (let handle of userIds) {
        console.log("fetching: ", handle);
        // await ts.fetch(`from_${handleNoAt}_${from}_${to}`, `from:${handleNoAt}`, from, to);
        await ts.fetch(`from_${handle}_${from}_${to}`, `from:${handle}`, from, to);
    }
}

//fetchCoronaMusicUsers();

async function runLasseLindekilde() {
    const credentials = require('./credentials').lindekilde;
    const dest = 'd:/temp/twitter/lindekilde-academic/conversations';
    const from = '2007-01-01'; // 2007-01-01 for badasskiyoko problem
    const to = '2021-03-15';

    let ts = new TwitterScraper(dest, credentials.bearerToken);
    //await ts.lookupTweets('tweets', 'd:/temp/twitter/lindekilde-academic/ids.txt');
    //await ts.extractConversationIds('d:/temp/twitter/lindekilde-academic/tweets/tweets.ndjson', 'convers-ids.txt')
    let conversationsIds = fs.readFileSync('d:/temp/twitter/lindekilde-academic/convers-ids_temp.txt', 'utf8').trim().split(/\r?\n/);
    conversationsIds = conversationsIds.filter((id) => !id.startsWith('//')); // make is possible to comment out
    await ts.fetchConversations(conversationsIds, from, to);
}

//runLasseLindekilde();



function readLines(filePath) {
    let lines = fs.readFileSync(filePath, 'utf8').trim().split(/\r?\n/);
    lines = lines.filter((id) => !id.startsWith('//')); // make is possible to comment out
    return lines;
}

function testRun() {
    let fs = require('fs');
    let { TwitterScraper } = require('./model/twitter-scraper');
    let response = fs.readFileSync('D:/twitter/academic-text/stop_words_2020-12-08_2020-12-08_sample.ndjson', 'utf8');
    response = JSON.parse(response);
    let ts = new TwitterScraper();
    //response.data = [response.data[14]] // temp
    ts._remapResponse(response);
    for (let tweet of response.data) {
        if (tweet.includes.places?.length > 0) { //tweet.errors?.length > 2
            console.log(JSON.stringify(tweet, null, 2));
            break;
        }
    }
    // console.log(response.data[0])
    //console.log(JSON.stringify(response.data[0], null, 2));
}
//testRun();

/*
vi skal have twitter-lite (cross-fetch -> node-fetch op til version 3.x) så kan vi i det mindste fange fejlene lader det til,
i stedet for den bare exitcode 0, fordi der et promise der måske ikke afslutter...
Det er først fixet fra 3.x ser det ud til i issues. 3.x er dog ikke kommet endnu, og cross-fetch opgraderer først når 3.0 kommer ud...

* NOTE fejl
* der er meget ustabilitet, vi får konstant ECONNRESET fejl og nogen gange lader det til at den opstår efte header er modtaget
* men inden vi får data. Det resulterer i at twitter-lite (som bruger node-fetch) fejler i response.json(), men den får ikke
* kastet en error, promise dør bare silently, har prøvet at se om jeg kunne ændre i deres kode for at fange fejl, men det lader det
* ikke til.
* I andre tilfælde så hænger forbindelsen bare for evigt...
* Så enten er det et problem på twitters side eller også min netværksforvindelse.
* - vi får også ECONNRESET på worker01
*
* vi skal hente resten af hope part2 og part3, brug tail til at tage den sidste date og brug dens millis timestamp til at definere "to"
* lav en part2_2 og part3_2 husk at sætte den rigtige query (search words)
* */

/*
* TODO kør det hele over på twitter-scraper-2, brug den alle steder også i cli programmerne
* */