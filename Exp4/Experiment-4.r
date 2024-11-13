library(ggplot2)

crime_data <- read.csv("london-outcomes.csv")

# Remove rows with missing Longitude or Latitude
crime_data_clean <- subset(crime_data, !is.na(Longitude) & !is.na(Latitude))

# Create a PDF file to store the plots
pdf("plots.pdf", width = 10, height = 8)

# Bar chart: Count of crimes by Outcome Type
ggplot(crime_data, aes(x = Outcome.type)) +
  geom_bar(fill = "steelblue") +
  labs(title = "Count of Crimes by Outcome Type",
       x = "Outcome Type",
       y = "Count") +
  theme_minimal() +
  theme(axis.text.x = element_text(angle = 45, hjust = 1))

# Pie chart: Proportion of crimes by Outcome Type
crime_outcome <- table(crime_data$Outcome.type)
pie(crime_outcome, 
    main = "Proportion of Crimes by Outcome Type", 
    col = rainbow(length(crime_outcome)),
    labels = paste(names(crime_outcome), "\n", round(prop.table(crime_outcome) * 100, 1), "%"))

# Convert 'Month' to Date format
crime_data$Month <- as.Date(paste0(crime_data$Month, "-01"), format = "%Y-%m-%d")

# Timeline chart: Number of crimes over time
ggplot(crime_data, aes(x = Month)) +
  geom_line(stat = "count", color = "darkred") +
  labs(title = "Number of Crimes Over Time",
       x = "Month",
       y = "Count") +
  theme_minimal()

# Histogram: Distribution of crimes by Longitude
ggplot(crime_data_clean, aes(x = Longitude)) +
  geom_histogram(binwidth = 0.01, fill = "skyblue", color = "black") +
  labs(title = "Distribution of Crimes by Longitude",
       x = "Longitude",
       y = "Count") +
  theme_minimal()

# Scatter plot: Latitude vs. Longitude of crime locations
ggplot(crime_data_clean, aes(x = Longitude, y = Latitude)) +
  geom_point(alpha = 0.6, color = "tomato") +
  labs(title = "Scatter Plot of Crime Locations",
       x = "Longitude",
       y = "Latitude") +
  theme_minimal()

crime_location_counts <- aggregate(Crime.ID ~ Longitude + Latitude, data = crime_data_clean, FUN = length)

# Bubble plot: Crime locations with bubble size by count
ggplot(crime_location_counts, aes(x = Longitude, y = Latitude, size = Crime.ID)) +
  geom_point(alpha = 0.5, color = "dodgerblue") +
  labs(title = "Crime Locations with Bubble Size by Count",
       x = "Longitude",
       y = "Latitude",
       size = "Crime Count") +
  theme_minimal()

dev.off()