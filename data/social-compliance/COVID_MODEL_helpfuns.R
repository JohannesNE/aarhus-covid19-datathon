#'@title Preprocessing
#'@description
#'The functions cleans up DMI data names
#'
#'@param dataframe a DMI datafile 
#'
#'@author
#'Lasse Hyldig Hansen
#'
#'@return 
#'Dataframe
#'
#'@references
#'Danish Meteorological Institute - Open Data: https://confluence.govcloud.dk/display/FDAPI/Danish+Meteorological+Institute+-+Open+Data
#'@export
PreProcessing1 <- function(dataframe) {
  humid <- dataframe[grepl("humidity_past1h", dataframe$V2),]
  temp <- dataframe[grepl("temp_mean_past1h", dataframe$V2),]
  wind <- dataframe[grepl("wind_speed_past1h", dataframe$V2),]
  precip <-  dataframe[grepl("precip_dur_past1h", dataframe$V2),]
  sun <- dataframe[grepl("sun_last1h_glob", dataframe$V2),]
  
  d <- rbind(humid, temp, wind, precip, sun)
  
  d$stationID <- gsub("stationId:", "", d$V3)
  d$stationID <- as.numeric(d$stationID)
  d$parameterId <- gsub("parameterId:", "", d$V2)
  d$value <- gsub("value:|}", "", d$V6)
  d$value <- as.numeric(d$value)
  data <- subset(d, select = c(stationID, parameterId, timeObs, value), subset = stationID >=5000 & stationID <=34000)
  return(data)
}


#'@title regex_s
#'@description
#'Regex function for getting station ID's of DMI stations saved 
#'
#'@param dataframe a dataframe for the station id to be extracted from
#'
#'@author
#'Lasse Hyldig Hansen
#'
#'@return 
#'DataFrame
#'
#'@references
#'Danish Meteorological Institute - Open Data: https://confluence.govcloud.dk/display/FDAPI/Danish+Meteorological+Institute+-+Open+Data
#'@export
regex_s <- function(dataframe) {
  vars <-  str_match(dataframe$timeObs, "(\\d+-\\d+-\\d+) (\\d+)")
  vars <-  as.data.frame(vars)
  vars <- vars[, -1]
  names(vars) <- c("Date", "Time")
  d <- cbind(vars, data.frame(dataframe$stationID, dataframe$parameterId, dataframe$value))
  colnames(d) <- c("Date", "Time", "stationID", "parameterId", "value")
  return(d)
}

#'@title Station_To_Municipality
#'@description
#'A function that turns station ID's into municipality ID's
#'
#'@param dataframe a dataframe for the station id to be extracted from
#'
#'@author
#'Lasse Hyldig Hansen
#'
#'@return 
#'DataFrame
#'
#'@references
#'Danish Meteorological Institute - Open Data: https://confluence.govcloud.dk/display/FDAPI/Danish+Meteorological+Institute+-+Open+Data
#'@export
Station_To_Municipality <- function(dataframe) {
  
  dataframe$Kommune <- ifelse(dataframe$stationID == 5005, "Hjørring",
                              ifelse(dataframe$stationID == 5009, "Hjørring",
                                     ifelse(dataframe$stationID == 5031, "Læsø",
                                            ifelse(dataframe$stationID == 5035, "Frederikshavn",
                                                   ifelse(dataframe$stationID == 5042, "Aalborg",
                                                          ifelse(dataframe$stationID == 5065, "Rebild",
                                                                 ifelse(dataframe$stationID == 5070, "Mariagerfjord",
                                                                        ifelse(dataframe$stationID == 5075, "Fredericia",
                                                                               ifelse(dataframe$stationID == 5081, "Vesthimmerlands",
                                                                                      ifelse(dataframe$stationID == 5085, "Vesthimmerlands",
                                                                                             ifelse(dataframe$stationID == 5089, "Thisted",
                                                                                                    ifelse(dataframe$stationID == 5095, "Thisted",
                                                                                                           ifelse(dataframe$stationID == 5105, "Morsø",
                                                                                                                  ifelse(dataframe$stationID == 5109, "Skive",
                                                                                                                         ifelse(dataframe$stationID == 5135, "Silkeborg",
                                                                                                                                ifelse(dataframe$stationID == 5140, "Randers",
                                                                                                                                       ifelse(dataframe$stationID == 5150, "Norddjurs",
                                                                                                                                              ifelse(dataframe$stationID == 5160, "Kerteminde",
                                                                                                                                                     ifelse(dataframe$stationID == 5165, "Samsø",
                                                                                                                                                            ifelse(dataframe$stationID == 5169, "Odder",
                                                                                                                                                                   ifelse(dataframe$stationID == 5185, "Skanderborg",
                                                                                                                                                                          ifelse(dataframe$stationID == 5199, "Ikast-Brande",
                                                                                                                                                                                 ifelse(dataframe$stationID == 5205, "Horsens",
                                                                                                                                                                                        ifelse(dataframe$stationID == 5220, "Hedensted",
                                                                                                                                                                                               ifelse(dataframe$stationID == 5269, "Ikast-Brande",
                                                                                                                                                                                                      ifelse(dataframe$stationID == 5272, "Ikast-Brande", dataframe$stationID ))))))))))))))))))))))))))
  
  
  dataframe$Kommune <- ifelse(dataframe$stationID == 5276, "Herning",
                              ifelse(dataframe$stationID == 5277, "Herning",
                                     ifelse(dataframe$stationID == 5290, "Struer",
                                            ifelse(dataframe$stationID == 5300, "Viborg",
                                                   ifelse(dataframe$stationID == 5305, "Ringkøbing-Skjern",
                                                          ifelse(dataframe$stationID == 5320, "Varde",
                                                                 ifelse(dataframe$stationID == 5329, "Varde",
                                                                        ifelse(dataframe$stationID == 5343, "Vejen",
                                                                               ifelse(dataframe$stationID == 5345, "Esbjerg",
                                                                                      ifelse(dataframe$stationID == 5350, "Tønder",
                                                                                             ifelse(dataframe$stationID == 5355, "Tønder",
                                                                                                    ifelse(dataframe$stationID == 5365, "Aabenraa",
                                                                                                           ifelse(dataframe$stationID == 5375, "Nordfyns",
                                                                                                                  ifelse(dataframe$stationID == 5381, "Tønder",
                                                                                                                         ifelse(dataframe$stationID == 5395, "Haderslev",
                                                                                                                                ifelse(dataframe$stationID == 5400, "Middelfart",
                                                                                                                                       ifelse(dataframe$stationID == 5406, "Nordfyns",
                                                                                                                                              ifelse(dataframe$stationID == 5408, "Odense",
                                                                                                                                                     ifelse(dataframe$stationID == 5435, "Faaborg-Midtfyn",
                                                                                                                                                            ifelse(dataframe$stationID == 5450, "Langeland",
                                                                                                                                                                   ifelse(dataframe$stationID == 5469, "Nyborg",
                                                                                                                                                                          ifelse(dataframe$stationID == 5499, "Ringsted",
                                                                                                                                                                                 ifelse(dataframe$stationID == 5510, "Skanderborg",
                                                                                                                                                                                        ifelse(dataframe$stationID == 5537, "Holbæk",
                                                                                                                                                                                               ifelse(dataframe$stationID == 5545, "Furesø",
                                                                                                                                                                                                      ifelse(dataframe$stationID == 5575, "Gribskov",
                                                                                                                                                                                                             ifelse(dataframe$stationID == 5735, "København",
                                                                                                                                                                                                                    ifelse(dataframe$stationID == 5880, "Slagelse", dataframe$Kommune ))))))))))))))))))))))))))))
  
  
  dataframe$Kommune <- ifelse(dataframe$stationID == 5889, "Faxe",
                              ifelse(dataframe$stationID == 5935, "Vordingborg",
                                     ifelse(dataframe$stationID == 5945, "Vordingborg",
                                            ifelse(dataframe$stationID == 5970, "Lolland",
                                                   ifelse(dataframe$stationID == 5986, "Vordingborg",
                                                          ifelse(dataframe$stationID == 5994, "Bornholm",
                                                                 ifelse(dataframe$stationID == 6019, "Thisted",
                                                                        ifelse(dataframe$stationID == 6031, "Aalborg",
                                                                               ifelse(dataframe$stationID == 6032, "Aarhus",
                                                                                      ifelse(dataframe$stationID == 6041, "Frederikshavn",
                                                                                             ifelse(dataframe$stationID == 6049, "Viborg",
                                                                                                    ifelse(dataframe$stationID == 6051, "Thisted",
                                                                                                           ifelse(dataframe$stationID == 6056, "Holstebro",
                                                                                                                  ifelse(dataframe$stationID == 6058, "Ringkøbing-Skjern",
                                                                                                                         ifelse(dataframe$stationID == 6065, "Vesthimmerlands",
                                                                                                                                ifelse(dataframe$stationID == 6068, "Ikast-Brande",
                                                                                                                                       ifelse(dataframe$stationID == 6072, "Favrskov",
                                                                                                                                              ifelse(dataframe$stationID == 6073, "Syddjurs",
                                                                                                                                                     ifelse(dataframe$stationID == 6074, "Aarhus",
                                                                                                                                                            ifelse(dataframe$stationID == 6079, "Norddjurs",
                                                                                                                                                                   ifelse(dataframe$stationID == 6081, "Varde",
                                                                                                                                                                          ifelse(dataframe$stationID == 6082, "Ringkøbing-Skjern",
                                                                                                                                                                                 ifelse(dataframe$stationID == 6088, "Fanø",
                                                                                                                                                                                        ifelse(dataframe$stationID == 6093, "Esbjerg",
                                                                                                                                                                                               ifelse(dataframe$stationID == 6096, "Tønder",
                                                                                                                                                                                                      ifelse(dataframe$stationID == 6102, "Horsens",
                                                                                                                                                                                                             ifelse(dataframe$stationID == 6116, "Aabenraa",
                                                                                                                                                                                                                    ifelse(dataframe$stationID == 6119, "Sønderborg", dataframe$Kommune ))))))))))))))))))))))))))))
  
  dataframe$Kommune <- ifelse(dataframe$stationID == 6123, "Assens",
                              ifelse(dataframe$stationID == 6124, "Svendborg",
                                     ifelse(dataframe$stationID == 6126, "Faaborg-Midtfyn",
                                            ifelse(dataframe$stationID == 6132, "Samsø",
                                                   ifelse(dataframe$stationID == 6135, "Slagelse",
                                                          ifelse(dataframe$stationID == 6136, "Slagelse",
                                                                 ifelse(dataframe$stationID == 6138, "Vordingborg",
                                                                        ifelse(dataframe$stationID == 6141, "Lolland",
                                                                               ifelse(dataframe$stationID == 6147, "Vordingborg",
                                                                                      ifelse(dataframe$stationID == 6149, "Guldborgsund",
                                                                                             ifelse(dataframe$stationID == 6151, "Slagelse",
                                                                                                    ifelse(dataframe$stationID == 6154, "Næstved",
                                                                                                           ifelse(dataframe$stationID == 6156, "Holbæk",
                                                                                                                  ifelse(dataframe$stationID == 6159, "Kalundborg",
                                                                                                                         ifelse(dataframe$stationID == 6168, "Gribskov",
                                                                                                                                ifelse(dataframe$stationID == 6169, "Odsherred",
                                                                                                                                       ifelse(dataframe$stationID == 6174, "Køge",
                                                                                                                                              ifelse(dataframe$stationID == 6181, "Gentofte",
                                                                                                                                                     ifelse(dataframe$stationID == 6183, "Tårnby",
                                                                                                                                                            ifelse(dataframe$stationID == 6184, "DMI",
                                                                                                                                                                   ifelse(dataframe$stationID == 6186, "Frederiksberg",
                                                                                                                                                                          ifelse(dataframe$stationID == 6187, "Kalundborg",
                                                                                                                                                                                 ifelse(dataframe$stationID == 6188, "København",
                                                                                                                                                                                        ifelse(dataframe$stationID == 6193, "Bornholm",
                                                                                                                                                                                               ifelse(dataframe$stationID == 6197, "Bornholm", dataframe$Kommune )))))))))))))))))))))))))
  
  dataframe$Kommune <- ifelse(dataframe$stationID == 5202, "Ikast-Brande",
                              ifelse(dataframe$stationID == 5225, "Aarhus",
                                     ifelse(dataframe$stationID == 5440, "Svendborg",
                                            ifelse(dataframe$stationID == 5455, "Langeland",
                                                   ifelse(dataframe$stationID == 5505, "Høje-Taastrup", dataframe$Kommune)))))
  
  return(dataframe)
}


#'@title PreProc
#'@description
#'Function that combines the above ones and groups by each station, date and parameter. Remember to change the file path to your own directory
#'
#'@param filename a filename for your datafiles
#'
#'@author
#'Lasse Hyldig Hansen
#'
#'@return 
#'DataFrame
#'
#'@references
#'Danish Meteorological Institute - Open Data: https://confluence.govcloud.dk/display/FDAPI/Danish+Meteorological+Institute+-+Open+Data
#'@export
PreProc <- function(filename) {
  data <- read.delim(paste0("/Users/lassehansen/Desktop/Lasse/Cognitive Science 3 Semester/Causal Inference/Causal-Inference/DMI/", filename), sep = ",", header = F)
  data$timeObs <-  gsub("timeObserved:", "", data$V5)
  data$timeObs <- as.numeric(data$timeObs)/10^6
  data$timeObs <- as.POSIXct(data$timeObs, origin = "1970-01-01", tz = "GMT")
  data <- PreProcessing1(data)
  data <-  regex_s(data)
  data <- data %>% 
    select(Date, Time, stationID, parameterId, value) %>% 
    group_by(Date, parameterId, stationID) %>% 
    summarise(
      DayValue_Param = mean(value, na.rm = T),
    ) %>% 
    spread(., key = parameterId, value = DayValue_Param)
  data$stationID <- as.numeric(data$stationID)
  data = Station_To_Municipality(data)
  return(data)
}

#'@title Region_identifier
#'@description
#'Function that identifies Regions from municipalities in Denmark
#'
#'@param dataframe a dataframe that contains Danish municipalities
#'
#'@author
#'Lasse Hyldig Hansen
#'
#'@return 
#'DataFrame
#'
#'@references
#'
#'@export
Region_identifier <-  function(dataframe) {
dataframe$Region <- ifelse(dataframe$Kommune == "Vallensbæk", "Capital Region of Denmark", 
                            ifelse(dataframe$Kommune == "Struer", "Central Denmark Region",
                                   ifelse(dataframe$Kommune == "Stevns", "Region Zealand",
                                          ifelse(dataframe$Kommune == "Solrød", "Region Zealand",
                                                 ifelse(dataframe$Kommune == "Odder", "Central Denmark Region",
                                                        ifelse(dataframe$Kommune == "Morsø", "North Denmark Region",
                                                               ifelse(dataframe$Kommune == "Lemvig", "Central Denmark Region",
                                                                      ifelse(dataframe$Kommune == "Lejre", "Region Zealand",
                                                                             ifelse(dataframe$Kommune == "Langeland", "Region of Southern Denmark",
                                                                                    ifelse(dataframe$Kommune == "Dragør", "Capital Region of Denmark",
                                                                                           ifelse(dataframe$Kommune == "Allerød","Capital Region of Denmark",
                                                                                                  
                                                                                                  
                                                                                                  ifelse(dataframe$Kommune == "Fanø","Region of Southern Denmark",
                                                                                                         ifelse(dataframe$Kommune == "Odder","Central Denmark Region",
                                                                                                                
                                                                                                                ifelse(dataframe$Kommune == "Kerteminde", "Region of Southern Denmark",
                                                                                                                       ifelse(dataframe$Kommune == "Sorø", "Region Zealand",
                                                                                                                              ifelse(dataframe$Kommune == "Ishøj","Capital Region of Denmark",
                                                                                                                                     ifelse(dataframe$Kommune == "Hørsholm", "Capital Region of Denmark",
                                                                                                                                            ifelse(dataframe$Kommune == "Herlev", "Capital Region of Denmark",
                                                                                                                                                   ifelse(dataframe$Kommune == "Glostrup","Capital Region of Denmark", 
                                                                                                                                                          ifelse(dataframe$Kommune == "Billund", "Region of Southern Denmark",
                                                                                                                                                                 
                                                                                                                                                                 ifelse(dataframe$Kommune == "Nordfyns", "Region of Southern Denmark",
                                                                                                                                                                        ifelse(dataframe$Kommune == "Vejle", "Region of Southern Denmark", 
                                                                                                                                                                               ifelse(dataframe$Kommune == "Vejen", "Region of Southern Denmark",
                                                                                                                                                                                      ifelse(dataframe$Kommune == "Varde", "Region of Southern Denmark",       
                                                                                                                                                                                             ifelse(dataframe$Kommune == "Tønder", "Region of Southern Denmark",
                                                                                                                                                                                                    ifelse(dataframe$Kommune == "Svendborg", "Region of Southern Denmark",
                                                                                                                                                                                                           ifelse(dataframe$Kommune == "Sønderborg", "Region of Southern Denmark",
                                                                                                                                                                                                                  ifelse(dataframe$Kommune == "Nyborg", "Region of Southern Denmark", dataframe$Region))))))))))))))))))))))))))))



dataframe$Region <-   ifelse(dataframe$Kommune == "Albertslund","Capital Region of Denmark",
                              ifelse(dataframe$Kommune == "Norddjurs", "Central Denmark Region",
                                     ifelse(dataframe$Kommune == "Odsherred", "Region Zealand",#region sjælland
                                            ifelse(dataframe$Kommune == "Randers", "Central Denmark Region",
                                                   ifelse(dataframe$Kommune == "Skanderborg", "Central Denmark Region",
                                                          ifelse(dataframe$Kommune == "Silkeborg", "Central Denmark Region",
                                                                 ifelse(dataframe$Kommune == "Skive", "Central Denmark Region",        
                                                                        ifelse(dataframe$Kommune == "Viborg", "Central Denmark Region", 
                                                                               ifelse(dataframe$Kommune == "Horsens", "Central Denmark Region", 
                                                                                      ifelse(dataframe$Kommune == "Frederiksberg", "Capital Region of Denmark",
                                                                                             
                                                                                             ifelse(dataframe$Kommune == "Kolding", "Region of Southern Denmark",
                                                                                                    ifelse(dataframe$Kommune == "Esbjerg", "Region of Southern Denmark",
                                                                                                           ifelse(dataframe$Kommune == "Middelfart", "Region of Southern Denmark",
                                                                                                                  ifelse(dataframe$Kommune == "Vesthimmerlands", "North Denmark Region",        
                                                                                                                         ifelse(dataframe$Kommune == "Thisted", "North Denmark Region",
                                                                                                                                ifelse(dataframe$Kommune == "Rebild", "North Denmark Region", 
                                                                                                                                       ifelse(dataframe$Kommune == "Mariagerfjord", "North Denmark Region", 
                                                                                                                                              ifelse(dataframe$Kommune == "Holstebro", "Central Denmark Region", # region midtjylland
                                                                                                                                                     ifelse(dataframe$Kommune == "Hjørring", "North Denmark Region",
                                                                                                                                                            
                                                                                                                                                            ifelse(dataframe$Kommune == "Roskilde", "Region Zealand",
                                                                                                                                                                   ifelse(dataframe$Kommune == "Ringsted", "Region Zealand",
                                                                                                                                                                          ifelse(dataframe$Kommune == "Rødovre", "Capital Region of Denmark",
                                                                                                                                                                                 ifelse(dataframe$Kommune == "Rudersdal", "Capital Region of Denmark",      
                                                                                                                                                                                        ifelse(dataframe$Kommune == "Vordingborg", "Region Zealand",
                                                                                                                                                                                               ifelse(dataframe$Kommune == "Kalundborg", "Region Zealand", 
                                                                                                                                                                                                      ifelse(dataframe$Kommune == "Køge", "Region Zealand", 
                                                                                                                                                                                                             ifelse(dataframe$Kommune == "Lolland", "Region Zealand", 
                                                                                                                                                                                                                    ifelse(dataframe$Kommune == "Holbæk", "Region Zealand",
                                                                                                                                                                                                                           ifelse(dataframe$Kommune == "Hvidovre", "Capital Region of Denmark",
                                                                                                                                                                                                                                  ifelse(dataframe$Kommune == "Ringkøbing-Skjern", "Central Denmark Region", 
                                                                                                                                                                                                                                         ifelse(dataframe$Kommune == "Næstved", "Region Zealand", 
                                                                                                                                                                                                                                                ifelse(dataframe$Kommune == "Hillerød", "Capital Region of Denmark",  
                                                                                                                                                                                                                                                       ifelse(dataframe$Kommune == "Helsingør", "Capital Region of Denmark",  
                                                                                                                                                                                                                                                              ifelse(dataframe$Kommune == "Guldborgsund", "Region Zealand",
                                                                                                                                                                                                                                                                     ifelse(dataframe$Kommune == "Gribskov", "Capital Region of Denmark",
                                                                                                                                                                                                                                                                            dataframe$Region)))))))))))))))))))))))))))))))))))


dataframe$Region <-   ifelse(dataframe$Kommune == "Bornholm","Capital Region of Denmark",
                              ifelse(dataframe$Kommune == "Brøndby", "Capital Region of Denmark",
                                     ifelse(dataframe$Kommune == "Egedal", "Capital Region of Denmark",
                                            ifelse(dataframe$Kommune == "Halsnæs", "Capital Region of Denmark",
                                                   ifelse(dataframe$Kommune == "Jammerbugt", "North Denmark Region",
                                                          ifelse(dataframe$Kommune == "Aabenraa", "Region of Southern Denmark",
                                                                 ifelse(dataframe$Kommune == "Assens", "Region of Southern Denmark",        
                                                                        ifelse(dataframe$Kommune == "Ballerup", "Capital Region of Denmark",
                                                                               ifelse(dataframe$Kommune == "Brønderslev", "North Denmark Region",     
                                                                                      ifelse(dataframe$Kommune == "Faaborg-Midtfyn	", "Region of Southern Denmark",
                                                                                             
                                                                                             ifelse(dataframe$Kommune == "Favrskov", "Central Denmark Region", 
                                                                                                    ifelse(dataframe$Kommune == "Faxe",  "Region Zealand",
                                                                                                           ifelse(dataframe$Kommune == "Fredericia", "Region of Southern Denmark",
                                                                                                                  ifelse(dataframe$Kommune == "Fredensborg", "Capital Region of Denmark",      
                                                                                                                         ifelse(dataframe$Kommune == "Frederikssund", "Capital Region of Denmark",
                                                                                                                                ifelse(dataframe$Kommune == "Furesø", "Capital Region of Denmark", 
                                                                                                                                       ifelse(dataframe$Kommune == "Gentofte", "Capital Region of Denmark", 
                                                                                                                                              ifelse(dataframe$Kommune == "Gladsaxe", "Capital Region of Denmark",
                                                                                                                                                     ifelse(dataframe$Kommune == "Greve", "Region Zealand",
                                                                                                                                                            
                                                                                                                                                            ifelse(dataframe$Kommune == "Haderslev", "Region of Southern Denmark",
                                                                                                                                                                   ifelse(dataframe$Kommune == "Hedensted", "Central Denmark Region", 
                                                                                                                                                                          ifelse(dataframe$Kommune == "Herning",  "Central Denmark Region", 
                                                                                                                                                                                 ifelse(dataframe$Kommune == "Høje-Taastrup", "Capital Region of Denmark",      
                                                                                                                                                                                        ifelse(dataframe$Kommune == "Ikast-Brande",  "Central Denmark Region", 
                                                                                                                                                                                               ifelse(dataframe$Kommune == "Slagelse", "Region Zealand", 
                                                                                                                                                                                                      ifelse(dataframe$Kommune == "Lyngby-Taarbæk", "Capital Region of Denmark", 
                                                                                                                                                                                                             ifelse(dataframe$Kommune == "Syddjurs", "Central Denmark Region", 
                                                                                                                                                                                                                    ifelse(dataframe$Kommune == "Frederikshavn", "North Denmark Region", 
                                                                                                                                                                                                                           ifelse(dataframe$Kommune == "Hvidovre", "Capital Region of Denmark",  
                                                                                                                                                                                                                                  ifelse(dataframe$Kommune == "Faaborg-Midtfyn","Region of Southern Denmark",       
                                                                                                                                                                                                                                         ifelse(dataframe$Kommune == "Ringkøbing-Skjern", "Central Denmark Region", 
                                                                                                                                                                                                                                                ifelse(dataframe$Kommune == "Næstved", "Region Zealand", 
                                                                                                                                                                                                                                                       ifelse(dataframe$Kommune == "Hillerød", "Capital Region of Denmark",  
                                                                                                                                                                                                                                                              ifelse(dataframe$Kommune == "Helsingør", "Capital Region of Denmark",  
                                                                                                                                                                                                                                                                     ifelse(dataframe$Kommune == "Guldborgsund", "Region Zealand",
                                                                                                                                                                                                                                                                            ifelse(dataframe$Kommune == "Gribskov", "Capital Region of Denmark",
                                                                                                                                                                                                                                                                                   ifelse(dataframe$Kommune == "Tårnby", "Capital Region of Denmark",   
                                                                                                                                                                                                                                                                                          ifelse(dataframe$Kommune == "Samsø", "Central Denmark Region",
                                                                                                                                                                                                                                                                                                 ifelse(dataframe$Kommune == "Odense", "Region of Southern Denmark",    
                                                                                                                                                                                                                                                                                                        ifelse(dataframe$Kommune == "Læsø", "North Denmark Region", 
                                                                                                                                                                                                                                                                                                               ifelse(dataframe$Kommune == "København", "Capital Region of Denmark",
                                                                                                                                                                                                                                                                                                                      ifelse(dataframe$Kommune == "Aalborg", "North Denmark Region",    
                                                                                                                                                                                                                                                                                                                             ifelse(dataframe$Kommune == "Ærø", "Region of Southern Denmark", 
                                                                                                                                                                                                                                                                                                                                    ifelse(dataframe$Kommune == "Aarhus", "Central Denmark Region",      
                                                                                                                                                                                                                                                                                                                                           ifelse(dataframe$Kommune == "Fanø", "Region of Southern Denmark",     
                                                                                                                                                                                                                                                                                                                                                  dataframe$Region)))))))))))))))))))))))))))))))))))))))))))))
return(dataframe) 
}




