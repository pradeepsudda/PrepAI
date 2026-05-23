# ── Stage 1: Build ──────────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /app

# Copy Maven wrapper and POM first to cache dependency downloads as a separate layer
COPY mvnw mvnw.cmd pom.xml ./
COPY .mvn .mvn

# Download dependencies (cached unless pom.xml changes)
RUN ./mvnw dependency:go-offline -q

# Copy source and build the JAR (skip tests — they require running DB/Redis)
COPY src src
RUN ./mvnw package -DskipTests -q

# ── Stage 2: Runtime ─────────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine AS runtime

WORKDIR /app

# Create a non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy the built JAR from the builder stage
COPY --from=builder /app/target/AiInterviewSystem-0.0.1-SNAPSHOT.jar app.jar

# Switch to non-root user
USER appuser

EXPOSE 8080

# Use exec form to ensure PID 1 is the JVM (proper signal handling)
ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-jar", "app.jar"]
