# Enterprise all-in-one: Angular SPA embedded in Spring Boot JAR
FROM node:22-alpine AS frontend-build
WORKDIR /ui
COPY frontend/airbook-ui/package.json frontend/airbook-ui/package-lock.json ./
RUN npm ci --prefer-offline --no-audit --no-fund
COPY frontend/airbook-ui/angular.json frontend/airbook-ui/tsconfig.json frontend/airbook-ui/tsconfig.app.json ./
COPY frontend/airbook-ui/public ./public
COPY frontend/airbook-ui/src ./src
RUN npm run build

FROM eclipse-temurin:17-jdk-alpine AS backend-build
WORKDIR /app
COPY backend/pom.xml .
RUN apk add --no-cache maven && mvn -q -B dependency:go-offline -DskipTests
COPY backend/src ./src
COPY --from=frontend-build /ui/dist/airbook-ui/browser ./src/main/resources/static
RUN mvn -q -B -DskipTests package

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
RUN apk add --no-cache wget
ENV SPRING_PROFILES_ACTIVE=prod
ENV JAVA_OPTS="-XX:+UseContainerSupport -Xms64m -Xmx256m -XX:MaxMetaspaceSize=128m -Djava.security.egd=file:/dev/./urandom"
COPY --from=backend-build /app/target/airbook-api-1.0.0.jar app.jar
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=8s --start-period=120s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/api/health | grep -q UP || exit 1
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
