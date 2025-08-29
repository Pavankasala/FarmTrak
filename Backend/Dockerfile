# Use official JDK 17 (lightweight alpine)
FROM eclipse-temurin:17-jdk-alpine AS builder

# Set work directory
WORKDIR /app

# Copy Maven wrapper + pom.xml
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Pre-download dependencies (better build cache)
RUN ./mvnw dependency:go-offline -B

# Copy the rest of the project
COPY src src

# Build the application
RUN ./mvnw clean package -DskipTests

# -----------------------
# Run Stage (smaller image)
# -----------------------
FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app

# Copy only the built JAR
COPY --from=builder /app/target/*.jar app.jar

# Expose backend port
EXPOSE 8080

# Run Spring Boot
CMD ["java", "-jar", "app.jar"]
