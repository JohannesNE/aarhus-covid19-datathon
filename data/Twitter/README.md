# Datathon tweets
The data in this folder consinsts of three different csv files: 
- "ID_list.csv" 
- "covid_tweets.csv"
- "sent.csv". 
Only Danish tweets are included in the datasets.
"tweets_subset.csv" is a subset of the "sent.csv" file containing the first 10,000 rows. 

## ID_list
"ID_list" contains a list of 19 million Danish Tweet-IDs. 

## covid_tweets
"covid_tweets.csv" contains 373.327 rows and three columns; 
- "ID", the unique tweet ID, 
- "created_at", the time and date of the Tweet, and 
- "text", the actual Tweets after preprocessing where retweets where removed along with Tweets written by bots. 
All of the Tweets in this file have been determined COVID-19 relevant. This was done by searching for "covid*" and "corona*" in the Tweets. Meaning all variations of the words were searched for. 

## sent
"sent.csv" contains approximately 14.5 million Tweets. 4 different models have been run on these Tweets. 
The following describes the models. 

### DaVader
The first model is the sentiment model DaVader (read more on https://spacy.io/models/da#da_core_news_lg). DaVader is a Danish Sentiment model developed using Vader and the dictionary lists from SentiDa and AFINN. This adaption is developed by Center for Humanities Computing Aarhus and Kenneth Enevoldsen.
It predicts the degree to which a text is neutral, negative and positive. 
It also calculates a compound score as a combination of the other score. Read more on the scoring here:
https://github.com/cjhutto/vaderSentiment?fbclid=IwAR2yZfybopQQXO2PaFp1J_leP4dtgSAed-kBWrJdNau6AvvJwCSEIXXceEU#about-the-scoring 

The columns associated with the DaVader sentiment scores are
- "Sentiment_compound", the combined score 
- "Sentiment_neutral", predicted degree of neutrality
- "Sentiment_negative", predicted degree of negativity
- "Sentiment_positive", predicted degree of positivity

### BERT subjectivity 
The BERT Tone subjectivity model is a model that predicts whether a text is subjective or not.
It also gives the calculated probability of that prediction. Read more on the BERT Tone model here: 
https://github.com/alexandrainst/danlp/blob/master/docs/docs/tasks/sentiment_analysis.md#bert-tone

The columns associated with the BERT Tone subjetivity model are
- "Bert_subj_label", the predicted label (binary, either "objective" or "subjective")
- "Bert_subj_prob", the calculated probability of the predicted label (number between 0 and 1)

### BERT emotion
The BERT Emotion model is a combination of two models;
- 1) predicting whether a text is emotional or not along with probability for that label, and
- 2) predicting emotion in question along with probability for that emotion
You can also read more on the BERT Emotion model here:
https://github.com/alexandrainst/danlp/blob/master/docs/docs/tasks/sentiment_analysis.md#bert-tone

The columns associated with the BERT Emotion model are:
- "Bert_emo_laden", predicted emotionality (binary, either "Emotional" or "No emotion")
- "Bert_emo_laden_prob", the calculated probability of predicted emotionality (number between 0 and 1)
- "Bert_emo_emotion", the predicted emotion in case of emotional text. If the text is predicted to be non-emotional, the value is NaN. 
- "Bert_emo_emotion_prob", a list containing 8 probabilities between 0 and 1. It is in the format of a string, where every probability is seperated by a space.

The 8 possible emotions are "glæde/sindsro", "forventning/interesse", "tillid/accept", "overraskelse/forundring", "vrede/irritation", "foragt/modvilje", "sorg/skuffelse", "frygt/bekymring". 
The 8 probabilities refer to the probabilities for each of these emotions in the order as listed here. 

---------------------------------------------------------------------------------


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
