'''
Example of how to reading the csv-files to pandas dataframe
'''
import pandas as pd

tweets_chunks = pd.read_csv('covid_tweets.csv', chunksize = 1000, names = ['id', 'created_at', 'text'])
sent_chunks = pd.read_csv('sent.csv', index_col=[0], chunksize = 1000)

# loading in sentiment scores for all tweets
sent_df = pd.DataFrame()
for chunk in sent_chunks:
    sent_df = pd.concat([sent_df,chunk])

# loading in covid tweets
df = pd.DataFrame()
tweet_df = pd.DataFrame()

for chunk in tweets_chunks:
    tweet_df = pd.concat([tweet_df,chunk])

# merging with sentiment scores
for chunk in sent_chunks:
    df = pd.concat([df,tweet_df.merge(chunk, on = ['id', 'created_at'])])

