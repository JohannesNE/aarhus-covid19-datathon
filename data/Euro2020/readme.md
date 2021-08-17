# Investigating national changes in incidence of SARS-CoV-2 infection during and after the European Football Championship 2020

These files will be used at the COVID-19 datathon in Aarhus from August 20-22 to investigate the effects
of EURO2020 on the participating countries' SARS-CoV-2 incidence.

`extr-data.R` combines relevant information from "Our World In Data", coronavirus.data.gov.uk and
manually curated data. The following datasets will be loaded as data.tables:  
* cases (daily confirmed cases by participating country)  
* vacc (proportion of population of a given country vaccinated, daily)  
* delta (number of confirmed delta variant infections and proportion of infections caused by delta in a given country, biweekly)  
* restr (daily information on policies regarding restrictions on public gatherings and mask usage)
* matches (results from EURO2020, one observation per match for each country)  

The initial plan is to perform an interrupted time series analysis and/or difference-in-difference,
with the intervention of interest being a given match (quarterfinal, semis, finals). 
Countries no longer participating in the Euros at a given stage can be used as a control series/comparator
(e.g. intervention = semis, control = lost in the quarterfinal).
Analyses should account for the proportion of individuals vaccinated in the given country and the spread
of the delta variant during the relevant time period.

Alternative analysis plans are more than welcome and may also replace the above mentioned.

## Relevant literature
[Bernal JL, Cummins S, Gasparrini A. Interrupted time series regression for the evaluation of public health interventions: a tutorial. Int J Epidemiol. 2017 Feb;46(1):348–55.](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5407170/)
[Haber NA, Clarke-Deelder E, Salomon JA, Feller A, Stuart EA. COVID-19 Policy Impact Evaluation: A guide to common design issues. American Journal of Epidemiology. 2021 Jun 28;kwab185.](https://academic.oup.com/aje/advance-article/doi/10.1093/aje/kwab185/6310594)
[Palladino R, Bollon J, Ragazzoni L, Barone-Adesi F. Excess Deaths and Hospital Admissions for COVID-19 Due to a Late Implementation of the Lockdown in Italy. IJERPH. 2020 Aug 5;17(16):5644.](https://www.mdpi.com/1660-4601/17/16/5644)
