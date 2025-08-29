# Use Eclipse Temurin JDK 17 Alpine image
FROM eclipse-temurin:17-jdk-alpine AS builder

# Set working directory
WORKDIR /app

# Install bash and git for Maven wrapper
RUN apk add --no-cache bash git

# Copy Maven wrapper files
COPY mvnw .
COPY .mvn .mvn

# Make Maven wrapper executable
RUN chmod +x mvnw

# Copy pom.xml first for caching dependencies
COPY pom.xml .

# Download dependencies offline
RUN ./mvnw dependency:go-offline -B

# Copy the full source code
COPY src ./src

# Package the application
RUN ./mvnw package -DskipTests

# -------------------
# Build runtime image
# -------------------
FROM eclipse-temurin:17-jdk-alpine

WORKDIR /app

# Copy the packaged jar from the builder
COPY --from=builder /app/target/*.jar app.jar

# Expose the port your app runs on
EXPOSE 8080

# Run the application
ENTRYPOINT ["java","-jar","app.jar"]
