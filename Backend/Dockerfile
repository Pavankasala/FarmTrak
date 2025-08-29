# Use Eclipse Temurin JDK 17 Alpine image
FROM eclipse-temurin:17-jdk-alpine AS builder

# Set working directory
WORKDIR /app

# Copy Maven wrapper
COPY mvnw .
COPY .mvn .mvn

# Make mvnw executable
RUN chmod +x mvnw

# Copy pom.xml first (for caching dependencies)
COPY pom.xml .

# Pre-download dependencies
RUN ./mvnw dependency:go-offline -B

# Copy source code
COPY src ./src

# Build the project
RUN ./mvnw clean package -DskipTests

# ----------- Runtime Stage -----------

FROM eclipse-temurin:17-jdk-alpine

WORKDIR /app

# Copy the jar from the builder stage
COPY --from=builder /app/target/backend-0.0.1-SNAPSHOT.jar ./backend.jar

# Expose port
EXPOSE 8080

# Run the backend
CMD ["java", "-jar", "backend.jar"]
