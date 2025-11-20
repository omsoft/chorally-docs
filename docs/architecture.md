---
sidebar_position: 2
title: Software Architecture
---

# Software Architecture

Easy Chorally is a multi layer system where several microservices operate through synchronous restful APIs, async workers and realtime data pipelines to exchange data, consume events, and communicate with social media platforms.

This page describes the overall software architecture, and offer guidelines to setup a service from scratch.

## Types of Services

There are 30+ microservices in the network, but they can be categorized in 3 groups:
- **I/O services** are abstraction layers for social media platforms (Meta, Linkedin, Microsoft, Google, etc)
  - They pull contents such as comments or reviews
  - They push contents such as new posts or business replies
  - They handle OAuth flows and token renewals to keep channels active
- **Ticket-related services** manipulate informations that belong to a Ticket (eg. messages, logs, metadata)
- **Feature-specific services** offer a specific functionality (eg. rules, chatbot, media upload, etc)

<!-- ![Diagramma dell'Architettura](images/architecture_diagram.png) -->

## Clusters
We run our systems in four main K8s clusters (environments):
- **chorally-dev (dev)**: represents the environment used by developers to build new functionalities
- **chorally-stage (stage)**: it's where members of QA/Product Team test new functionalities before release
- **chorally-prod (app)**: production environment used by most of Chorally customers
- **aks-sogei (az)**: custom production environment for Agenzia delle Entrate

## Data flow & Events

Here's what happens behind the scenes for different scenarios...

### Incoming messages

1. **I/O services** pull data from social networks via webhooks or scheduled imports
2. New authors are sent to **Author Service** via Kafka on `authors` topic
2. New messages are sent to **Message Service** via Kafka on `messages` topic
3. **Message Service** organizes them in separate tickets (one for each author)
4. **Log Service** creates a log of what just happened and notifies the rules engine
5. **Rules Engine** executes rules that match with specified conditions
5. Agents can now see and reply to individual tickets from Chorally UI

### Outbound contents

**Ticket Replies: when agents reply to a ticket...**

1. The reply is sent to **Message Service**
2. Message Service sends a Kafka event to the specific **I/O channel**
3. **I/O service** calls external APIs to send the reply on the social network
4. The ID of the published reply is returned back with a "reconciliation event"

**Publishing: when agents create new Page Posts...**

1. Agents create drafts of new posts through **Publishing Service**
2. Posts must be approved by agents with adeguate permissions
3. When approved, posts are sent to **I/O services** via Kafka
4. **I/O services** call external APIs to publish the content
5. The ID of the published content is returned back to Publishing Service with a "reconciliation event"

**New Conversation: when agents wants to communicate 1on1 with a customer...**

1. Agents create a new conversation through **Outbound Service**
2. **Outbound Service** dispatches a Kafka event to the desired **I/O channel**
3. **I/O service** calls external APIs to publish the content
4. The ID of the published content is returned back with a "reconciliation event"

### Domain Provisioning

It's possible to set up a new domain and enable a subset of functionalities to a specific customer via a step-by-step provisioning procedure. Here's how:

1. Go to console.ENV.chorally.com and login
2. Create a new instance with customer data and select or create a package (set of features and modules)
3. Click on create and wait for the procedure to complete

This will trigger a sequence of events:
- **Package Service** will receive the web request with selected informations
- A Kafka event is sent to **Provision Service** that will configure the network (K8s, S3, Keycloak)
- An email with credentials is sent to each admin
- The domain is now ready

### Rules Execution

Understanding how Rules work is very important since Chorally heavily relies on them. There are two different services:

- **Rule Service**: sends automatic replies based on temporal conditions (working days, opening/closing hours, special festivities, etc). Every time a new message enters the system, Rule Service evaluate if an automatic reply must be sent... therefore speeding up the feedback loop to the customer when the business is temporarily closed and no agent can offer support.

- **Rule Engine Service**: leveraging Drools, a BRMS system, it facilitates writing rules in a format which is easy to understand and allows to run actions against tickets when a new message arrives.

Both systems starts automatically whenever a new message arrives. I/O services will receive the message, send it via Kafka to Message Service, then Message Service will dispatch a log to Log Service, and Log Service sends a "rule-trigger" event to Rules Engine. This engine will fetch active rules from its database and check if they match with message properties. If they do, Drools runs the associated action (could be "send message", "set tag", or whatever action was configured).

## Point-to-Point Communication
Services share data in two ways:
1. **Kafka**: event-driven asynchronous requests
2. **REST APIs**: synchronous data exchange

In the next few lines you'll learn how to engineer them appropriately.

### API Ingresses
Services in the network are accessible via a standard url structure: **https://api.ENV.chorally.com/SERVICE**

*[ENV is the environment, and SERVICE is the service as defined in the Kubernetes configuration]*

This url is open to the public. So be aware of the risks when you add new endpoints or assets!

For example, if your service is called chatbot, you can access its APIs with: https://api.dev.chorally.com/chatbot/v1/add

### API Authorization
Every single API entrypoint MUST be authorized and actions performed only if successful. The only exception is represented by Kafka consumers that receives realtime events from the broker (they do not require authorization).

There are two ways...

A **JWT Signed Token** issued by Keycloak is the preferred way to go (especially for requests that come from Chorally User Interface). A JWT contains relevant informations about the specific Tenant and User performing the action, and is subject to expiration allowing for a stronger identity management and detection. If you receive a JWT you must verify the signature against the Keycloak SSL certificates before authorizing the request.

Alternatively, you can use a **custom Secret Token**. A token only you (the receiver) and the other service (the sender) are aware of. This token can be easily stored in environment variables within the cluster, and rotated for security reasons every once in a while.

Here's an example of both:

```
# JWT Signed Token
Authorization: Bearer [jwt_token]

# Secret Token
Authorization: Token [secret_token].[tenant]
```

### Kafka Events

All Kafka events follow this simple structure:

```json
{
  issuer: "message-service",             // name of service sending it
  event: "add",                          // event name
  data: {                                // object with custom properties
    body: "Hey, can you help me?",
    external_id: "1234567",
    received_at: "2025-11-14T18:30:00Z"
    ...
  }
}
```

The TOPIC must be chosen appropriately. Its name represents the entity being sent.

#### Reserved Topics
We have a bunch of reserved topics:
- **messages**: used by message-service for add/update/delete events
- **tickets**: used by message-service to update ticket properties
- **logs**: used by log-service
- **authors**: used by author-service
- **rule-triggers**: used by rules-engine to trigger rules evaluation
- **queue-triggers**: used by rules-engine to trigger rules evaluation

**Each I/O service has its own topic** used for agent replies or other updates that must be sent to the social network (eg. trustpilot_review, facebook_comment, etc)

## Tecnologies

### Languages & Frameworks
- **Ruby with Grape**
- **Go**
- **Java/Spring Boot**

### Database
- **MongoDB** (main choice)
- **MySQL** (will be migrated to Mongo)
- **Redis** (as in-memory cache storage)

### Hard dependencies

The system is integrated with the following components and cannot operate without them:

- **Keycloak**: Identity Server used for authentication and authorization of web requests
- **Kafka**: Realtime messaging for async communications among microservices
- **S3 Storage**: Storage system with isolated buckets for objects and media
- **Mongo**: Database engine used my most microservices in the network
- **Redis**: In-memory data store for low latency data manipulation
- **OpenSearch**: Distributed search engine that store data and process search requests.
- **Kubernetes**: Container orchestration platform that manages clusters, load balancing, and configuration

## Deployment

All microservices are designed to be distributed as Docker containers within Kubernetes clusters, and configured with environment variables.


---

*Latest update: 2025-11-14*