---
sidebar_position: 20
title: Architecture
authors: ["Mattia Orfano"]
tags: [backend, ruby, opensearch, sidekiq, kafka, mongo]
---

## Internal Design

Message Service follows a modular architecture and has the following components:

1. **API**: offers RESTful endpoints for read/write operations on supported entities
   - built upon Grape, a simple DSL to easily develop RESTful APIs in 30 seconds or less
2. **Consumers**: elaborates Kafka events for incoming messages and updates on supported entities
   - built upon Karafka, a multi-threaded Kafka processing framework
3. **Models**: defines entities and their relationships stored within Mongo documents
   - built upon Mongoid, the Mapper framework for MongoDB
4. **Jobs**: background jobs handled by Sidekiq
   - each Job can run on a different Redis queue, with higher or lower priority, and different retry options
5. **Services**: business logic for different types of operations on tickets, messagges, origins e queues
   - each service follows the Command Pattern and business logic is wrapped into a sequential set of operations

Every touchpoint (API, Kafka consumer, Job) is isolated, meaning it works in conjuction with the current tenant from which a request comes from. This ensures that users and agents will see only data the belongs to them.

## Entities & Callbacks

It's important to understand what are the main entities and their respective callbacks (automatic events that are triggered before/after updates).

### Ticket

A ticket represents a customer case. It contains:

- Messagges from customers and agents
- Status informations (created, working, pending, followup, solved, closed)
- Owner (who's the agent working on it and its group)
- Metadata (sentiment, timestamps, etc)

A ticket can be organized in Queues by automatic rules that are evaluated when the message arrives.

Some ticket properties are automatically generated and assigned:
- *sequence* is a unique identifier within the same Tenant
- *star_rating* is the latest customer rating (when applicable, such as Trustpilot Reviews)
- *count of visible messages*: the number of messages that are NOT shadowed (explained below)
- *metadata*: timestamps

After a Ticket gets created or updated, a Sidekiq async job ensures that Opensearch indexes are up-to-date.

Since a small property change could invalidate the association between a ticket and a queue (based on conditions defined in the Queue itself), a ticket is always removed from its queues when updated, and sent to rules engine that will later decide where to assign it. This mechanism ensures that every Queue always contains the expected tickets.

### Message

A message represents a single interaction inside a ticket. It can be:

- Message from the social network (written by a customer)
- Agent's reply (written from Chorally to the customer)
- Private Note (only visible to agents)
- AI-generated message
- AI-generated suggestion (only visible to agents)

Messagges can include attachments.

A message can be deleted, hide (for moderation) or shadowed (if the corresponding Origin is disabled, new messages are always pulled into Chorally but they are not shown until the Origin gets re-activated again).

Messages are grouped together in threads based on AUTHOR-ORIGIN pair; if the same person writes multiple messages over time, Chorally keeps track of these conversations via a unified thread. But different tickets might be created depending on the operations performed by agents.

When a new message arrives, the systems performs a set of operations:
- find the corrisponding Origin (channel where the message belongs)
- find or create Thread using Origin and Author
- find or create the ticket (if same customer already has an active ticket, use that)
- appends message to the ticket
- changes ticket state following the state machine
- set ticket properties if an applicable EnrichmentList exists
- creates a log into the system, triggers rules engine

### Origin

An Origin represents a communication channel between the Business and its customers. Examples include:

- Facebook (comments on wall, private messages)
- Instagram (same as above)
- X/Twitter
- WhatsApp Messages
- LinkedIn Comments
- Mail
- etc

Every Origin has a state (can be disabled at any given time). Disabling an Origin does not prevent messages from being imported on channels that belongs to webhooks. They will be saved anyway but hidden from agents. This way they won't be lost if Business decides to re-enable Origin after a while.

### Queue

A Queue helps organizing tickets that reflect specific properties/conditions. A queue can:

- Be visible to specific groups or agents
- Have counters for different ticket states
- Sorted by priority

## Background Workers

Message Service operates asynchronously in 2 ways:

### Sidekiq Jobs

Jobs are operations that can be executed seprately from web requests and direct agents operations. They are regularly pushed/pulled from Redis queues, and includes:

- **Ticket Reindex**: searching on tickets is performed through Opensearch and indexes must be kept aligned. So every time a ticket changes, a job is enqueued to perform a reindex for that ticket.
- **Ticket Closure**: When a ticket hits the solved or pending state, it will be automatically closed after 24hours (unless a new message comes in). 
- **Followup**: When a ticket is transitioned to Followup, it must goes back to "working" state after the specified period of time.
- **Sync Queue Counters**: every time a Ticket is added or removed from a Queue, we must update the UI counters of that Queue (so agents instantly see the numbers of tickets growing in the queues). This is done asynchrounsly with a Job.

### Kafka Consumers

Another type of async operations are realtime messages that arrives via Kafka. Message Service heavily relies on them to pull new messages from social networks (read the Kafka chapter for in-depth overview of this part).

- **Messages**: Incoming messages from social networks or message-related ops (eg. remove)
- **Tickets**: Ticket-related events that might be triggered by rules engine (eg. set state)
- **Queues**: special consumer used to re-evaluate all tickets under a Queue when it gets updated
- **AI Messages**: events from AI Chatbot (automatic replies or suggestions)
- **Metadata**: detects changes to tag, topic and custom fields in order to update Queue-Ticket associations
- **Escalation**: manages escalation events

## Configurations

These are required env variables:

- Kafka (KAFKA_HOST, KAFKA_REPLICATION_FACTOR)
- MongoDB (MONGODB_HOST, MONGODB_PORT, MONGODB_USERNAME, MONGODB_PASSWORD)
- Redis (REDIS_DB_NUMBER, REDIS_HOST, REDIS_PORT, REDIS_USERNAME, REDIS_PASSWORD, REDIS_CLUSTER, REDIS_SENTINEL_USERNAME, REDIS_SENTINEL_PASSWORD, REDIS_CLUSTER_PORT)
- OpenSearch (OPENSEARCH_HOST, OPENSEARCH_PORT, OPENSEARCH_USERNAME, OPENSEARCH_PASSWORD)
- Application-specific (MESSAGE_SERVICE_ENV, TICKET_CLOSED_AFTER_MINS, SIDEKIQ_MAX_RETRIES, ADMIN_TOKEN_SECRET)
- External services URLs (USER_SERVICE_URL, TICKET_HELPER_SERVICE_URL, AITOOLBOX_SERVICE_URL)

