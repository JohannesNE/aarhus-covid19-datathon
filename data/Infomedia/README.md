# Danish newspapers derived dataset
2021-08-19

## Description  
This dataset is derived from [Infomedia](Infomedia.dk), a proprietary Danish media archive.

Unfortunately, we are not allowed to share the text itself, so instead we are sharing the inferred [LDA](https://en.wikipedia.org/wiki/Latent_Dirichlet_allocation) topic distributions of each article in addition to the 10 most associated words within that topic.

[Derived newspaper data is available here]("https://sciencedata.dk/shared/99c59fb49bd67062881050781322a0b8")

We have trained two topic models: one on omnibus newspapers and one on tabloid newspapers as their reporting styles are different.


## Newspapers
Print & web versions.

__Tabloid newspapers__
- BT
- Ekstrabladet

__Omnibus newspapers__
- Information
- Jyllands Posten
- Kristelight Dagblad
- Politiken
- Weekendavisen
- (Berlingske)


### Articles
|   | Omnibus  | Tabloids  |
|---|---|---|
| Total number of articles  | 328,129  | 205,529  |
| First article  | 2019-12-02  | 2019-12-02  |
| Last article  | 2021-01-21  | 2021-01-21  |


## Metadata
- date (e.g. "2019-12-02T00:00:00Z")
- source_name (e.g. "politiken")
- source_type ("print" OR "web")

In separate files:
- topic content (.txt files)


## Usage
The dataset comes in two formats: new-line delimited json & CSV.  
Pick the format that suits you best.

Loading the dataset (or its omnibus part):

__ndjson version__
```
import ndjson

with open('Omnibus/topics_omnibus.ndjson') as f:
    omnibus = ndjson.load(f)
```

__CSV version__
```
import pandas as pd

omnibus = pd.read_csv('Omnibus/topics_omnibus.csv')

# optional parsing of article timestamps
omnibus['date'] = pd.to_datetime(omnibus['date'])
```


## Files (on sciencedata.dk)
Unzipped, the two folders are ~2.2 GB.
```
Infomedia/
│ 
├── Tabloid/ (in tabloid.zip)
│   ├── topics_tabloid.ndjson
│   │       tabloid articles - ndjson version
│   ├── topics_tabloid.csv
│   │       tabloid articles - csv version
│   ├── coherence_tabloid.txt
│   │       coherence scores: a) whole model b) per topic
│   └── content_tabloid.txt
│           topic model - top words per topic
│ 
├── Omnibus/ (in omnibus.zip)
│   ├── topics_omnibus.ndjson
│   │       omnibus articles - ndjson version
│   ├── topics_omnibus.csv
│   │       omnibus articles - csv version
│   ├── coherence_omnibus.txt
│   │       coherence scores: a) whole model b) per topic
│   └── content_omnibus.txt
│           topic model - top words per topic
|   
└── README.md
```


## Representation of articles: topic distribution
We trained LDA topic models to represent articles by their topic distributions.

A topic is essentailly a cluster of related words (that often appear together).
As an example, the following topic captures writing about US presidents & politics. 
Top ten most associated words are shown along with their probabilities.
```
(5, '0.065*"usa" + 0.043*"præsident" + 0.041*"amerikansk" + 0.030*"trump" + 0.021*"obama" + 0.018*"bush" + 0.014*"donald" + 0.013*"amerikaner" + 0.009*"george" + 0.008*"politisk"')
```

Each article is represented by a vector of 100 values (topics).
This number of topics yielded marginally the highest [C_v topic coherence](https://radimrehurek.com/gensim/models/coherencemodel.html); Although the parameter search was limited (models with 50, 100 and 150 topics were fitted on only the printed articles from both source types).

Each value in the topic distribution of an article (100 values) corresponds to the probability of a topic appearing in a given article.  

Topic probabilities range between 0 and 1 and each topic distribution/vector adds up to 1 (or very close to it).

Topics are numbered from 0 to 99.
See which words make the topics in the txt files.


## Dataset generation
- concatenate news articles into a single string
    - heading, subheading, text body
- preprocessing
    - remove html tags
    - replace non-word characters (e.g. punctuation, special characters) with a whitespace
    - remove digits
    - remove [stopwords](https://github.com/stopwords-iso/stopwords-da/blob/master/stopwords-da.txt)
    - remove excess whitespace
    - lemmatization (using spaCy's `da_core_news_sm` model)
    - lowercasing
    - remove tokens that appear less than 10 times in the whole dataset
- training the topic model
    - [gensim's LdaModel](https://radimrehurek.com/gensim/models/ldamodel.html#gensim.models.ldamodel.LdaModel) default hyperparameters
        - (alpha) inferred symmetric priors per topic 
        - (eta) no apriori assumptions about words
    - c_v coherence grid search on print media only
        - tabloid final model ≈ 0.28 at 100 topics (0.26 on other settings). 100 topics chosen for simplicity.
        - omnibus final model ≈ 0.45 at 100 topics.


## Useful
- [Infomedia database](https://apps-infomedia-dk.ez.statsbiblioteket.dk:12048/mediearkiv) (access through the Danish Royal Library)
