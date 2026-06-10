# syntax=docker/dockerfile:1.6
# =============================================================
#  Finova Budget Tracker — multi-stage production Dockerfile
# =============================================================

# ---------- 1. Build stage ----------
FROM maven:3.9.7-eclipse-temurin-17 AS build
WORKDIR /workspace

# Cache dependencies first
COPY pom.xml ./
RUN --mount=type=cache,target=/root/.m2 mvn -B -ntp dependency:go-offline

# Compile + package
COPY src ./src
RUN --mount=type=cache,target=/root/.m2 mvn -B -ntp clean package -DskipTests

# ---------- 2. Runtime stage ----------
FROM eclipse-temurin:17-jre-alpine
LABEL org.opencontainers.image.title="Finova Budget Tracker"
LABEL org.opencontainers.image.description="Personal finance management API — Spring Boot"
LABEL org.opencontainers.image.licenses="MIT"

# Run as non-root
RUN addgroup -S finova && adduser -S finova -G finova
USER finova
WORKDIR /app

COPY --from=build /workspace/target/finova-budget-tracker.jar /app/app.jar

ENV JAVA_OPTS="-XX:+UseG1GC -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
    CMD wget -qO- http://localhost:8080/actuator/health | grep -q '"status":"UP"' || exit 1

ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar /app/app.jar"]
