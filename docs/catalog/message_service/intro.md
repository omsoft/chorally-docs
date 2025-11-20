---
sidebar_position: 10
authors: ["Mattia Orfano"]
tags: [backend, ruby, opensearch, sidekiq, kafka, mongo]
---

# Overview & Purpose

https://gitlab.navarcos.ccoe-nc.com/chorally/easy-chorally/message-service

Message Service stores **inbound and outbound messages, tickets, origins (business profiles) & queues (groups of tickets)**.

All interactions between customers and business profiles from multiple sources (social media, email providers, etc) are organized in threads/tickets/queues. These entities can be managed by agents through high-level APIs.

## Tecnology Stack

- **Language/Framework**: Ruby with Grape (API RESTful)
- **Database**: MongoDB
- **Messaging**: Kafka
- **Cache/Job Queue**: Redis with Sidekiq
- **Search**: OpenSearch
- **Web Server**: Puma

## Dependencies

- **Keycloak**: Identity Server used for authentication and authorization of web requests
- **Kafka**: Realtime messaging for async communications among microservices
- **Mongo**: Database engine used my most microservices in the network
- **Redis**: In-memory data store for low latency data manipulation
- **OpenSearch**: Distributed search engine that store data and process search requests.
- **Kubernetes**: Container orchestration platform that manages clusters, load balancing, and configuration

## K8 Containers

Expect the following containers in the Kubernetes pod:

- **api**: runs the Puma web server and contains logs about web requests
  - `./bin/run_puma.sh`
- **consumer**: runs the Karafka consumer and contains logs about Kafka events and realtime messaging
  - `./bin/run_karafka.sh`
- **sidekiq**: runs Sidekiq workers and contains logs about async background jobs
  - `bundle exec sidekiq`

---

*Ultimo aggiornamento: 2025-11-17*