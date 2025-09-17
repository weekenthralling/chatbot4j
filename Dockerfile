FROM node:lts-alpine AS frontend-builder

ARG PUBLIC_URL=

WORKDIR /build

COPY web/package.json web/yarn.lock web/.yarnrc.yml ./
RUN corepack enable \
  && yarn install --immutable

COPY web/ ./
RUN yarn build

FROM openjdk:17-jdk-slim AS backend-builder
WORKDIR /build
COPY . .
COPY --from=frontend-builder /build/dist ./src/main/resources/static
RUN /build/mvnw clean package -DskipTests

FROM openjdk:17-jdk-slim AS app
WORKDIR /app
COPY --from=backend-builder /build/target/chatbot4j-*.jar ./app.jar

RUN adduser --system --group chatbot4j \
  && chown -R chatbot4j:chatbot4j /app
USER chatbot4j:chatbot4j

ENTRYPOINT exec java -jar $JAVA_OPTS /app/app.jar
