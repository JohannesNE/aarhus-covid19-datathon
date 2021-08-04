library("data.table")

# Datasets for investigating changes in spread of SARS-CoV-2 after
# the European football championship (EURO2020)

# All participants in the round of 16 - can be extended to all participants if needed
ro16 <- c("belgium", "portugal",
          "italy", "austria",
          "france", "switzerland",
          "croatia",  "spain",
          "sweden", "ukraine",
          "germany", "denmark",
          "netherlands", "czechia",
          "wales", "england")

# Case counts for each country
# Data is obtained from OWID for all countries except Wales and England
cases <- fread("https://github.com/owid/covid-19-data/raw/master/public/data/jhu/new_cases.csv")
setnames(cases, tolower)
cases <- cases[between(date, as.Date("2021-05-11"), as.Date("2021-08-11")), 
               c("date", ro16[1:14]), with = FALSE]
cases <- melt(cases, "date", variable.name = "country", value.name = "newcases")

# Obtain UK data stratified by nation (Wales/England)
uk <- fread("https://api.coronavirus.data.gov.uk/v2/data?areaType=nation&metric=newCasesByPublishDate&format=csv")
uk[, areaName := tolower(areaName)]
uk <- uk[between(date, as.Date("2021-05-11"), as.Date("2021-08-11")) &
         areaName %in% ro16[15:16], .(date, country = areaName, newcases = newCasesByPublishDate)]
cases <- rbindlist(list(cases, uk))
rm(uk)

# Obtain data on daily vaccination progress in %
vacc <- fread("https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/vaccinations/vaccinations.csv")
vacc[, location := tolower(location)]
vacc <- vacc[between(date, as.Date("2021-05-11"), as.Date("2021-08-11")) & 
             location %in% ro16]
setnames(vacc, c("location", "people_vaccinated_per_hundred", "people_fully_vaccinated_per_hundred"),
               c("country", "vx", "vx_full"))
vacc <- vacc[, .(date, country, vx, vx_full)]

# Obtain biweekly information on the proportion of SARS-CoV-2 infections with
# the delta variant from OWID (all countries except England, Wales and Ukraine)
delta <- fread("https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/variants/covid-variants.csv")
delta[, location := tolower(location)]
delta <- delta[variant == "Delta" &
               location %in% ro16 &
               between(date, as.Date("2021-05-11"), as.Date("2021-08-11"))]
delta <- delta[, .(country = location, date, num_sequences, perc_sequences)]

# Data for Wales/England were manually obtained from: 
# https://www.gov.uk/government/publications/covid-19-variants-genomically-confirmed-case-numbers
# As of 2021-08-04, no denominator is reported (i.e. number of samples sequenced) for Wales/England
uk <- data.table(
  date =    c("2021-05-27", "2021-06-03", "2021-06-09", "2021-06-18", "2021-06-25", "2021-07-02", "2021-07-09", "2021-07-16"),
  england = c(6180,       10797,        39061,        70856,        102019,       148538,       180643,       209926),
  wales =   c(58,         97,           184,          488,          788,          1749,         3666,         5601)
)
uk <- melt(uk, "date", variable.name = "country", value.name = "num_sequences")
uk[, num_sequences := num_sequences - shift(num_sequences, 2, type = "lag"), by = country] # Transform weekly to biweekly data to harmonise UK data with OWID
delta <- rbindlist(list(delta, uk), fill = TRUE)

# Restrictions on public gatherings and facial coverings (from Oxford COVID government response tracker)
restr <- fread("https://github.com/OxCGRT/covid-policy-tracker/blob/master/data/OxCGRT_latest.csv?raw=true")
setnames(restr, tolower)
restr[, countryname := tolower(countryname)]
restr[, regionname := tolower(regionname)]
restr <- restr[(countryname %in% ro16) | 
               (countryname == "united kingdom" & regionname %in% ro16) |
               (countryname == "czech republic")]
# Transform United Kingdom to England and Wales (restrictions applied to both nations)
restr[countryname == "united kingdom", countryname := regionname]
restr[, date := as.Date(paste0(substr(date, 1, 4), "-", substr(date, 5, 6), "-", substr(date, 7, 8)))]
restr <- restr[between(date, as.Date("2021-05-11"), as.Date("2021-08-11"))]
restr <- restr[, .(country = countryname, date, 
                   masks = `h6_facial coverings`, gatherlim = `c4_restrictions on gatherings`)]
restr[, gatherlim := factor(gatherlim, levels = 0:4, labels = c("no restr", "1000+", "<1000", "<100", "<10"))]
restr[, masks := factor(masks, levels = 0:4, labels = c("never", "recommended", "risk situations", "public spaces", "always"))]

# Match results for EURO2020 (manually curated)
matches <- fread("matches.csv")

# Transform EURO2020 data to contain 1 observation per match per country
# Split matches into home and away matches
hometeam <- matches[, .(date, home, stage, res, penalties)]
setnames(hometeam, "home", "country")
hometeam[, home := TRUE]

awayteam <- matches[, .(date, away, stage, res, penalties)]
setnames(awayteam, "away", "country")
awayteam[, home := FALSE]

# Combine
matches <- rbind(hometeam, awayteam)
matches[, goals := fifelse(home == TRUE,
                           as.numeric(substr(res, 1, 1)),
                           as.numeric(substr(res, 3, 3)))]
matches[, opp_goals := fifelse(home == TRUE,
                               as.numeric(substr(res, 3, 3)),
                               as.numeric(substr(res, 1, 1)))]
matches[, result := fcase(goals < opp_goals, 0,   # Lost
                           goals == opp_goals, 1, # Draw
                           goals > opp_goals, 2)] # Won

# Find winner for matches ending in a draw beyond the group stage
matches[!grepl("Group", stage) & result == 1, 
         result := fifelse(country == penalties, 2, 0)]
matches <- matches[, .(date, country, stage, home, goals, opp_goals, result)] # Drop unneeded variables
matches[, penalties := grepl("Group", stage) & goals == opp_goals] # Indicator variable if the match was decided by penalties
matches[grepl("Group", stage), stage := substr(stage, 1, 5)]

rm(hometeam, awayteam)
