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

## Entities

It's important to understand what are the main entities and their respective callbacks (events triggered before/after updates).

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


## Data Flow

1. **When a Message arrives from social media**:
   - A message is received from a social page (eg. Facebook, Instagram)
   - The system looks for (or create) the associated Thread
   - The system looks for (or create) the associated Ticket
   - The message gets stored and linked to the ticket and thread
   - Ticket state changes based on the state machine

2. **When a Message is sent out to a Page**:
   - An agent from Chorally UI sends a reply to a ticket
   - The message gets appended to the existing ticket
   - The message gets sent to the appropriate I/O service
   - The ticket state changes based on the state machine

## Async Work

Message Service operates asynchronously in 2 ways:

### Sidekiq Jobs

Jobs are async operations that run separately from web requests. They are triggered manually by agents or automatically by rules, and regularly pulled from different Redis queues by Sidekiq Workers.

These jobs include:

- **Ticket Reindex**: searching on tickets is performed through Opensearch and indexes must be kept aligned. So every time a ticket changes, a job is enqueued to perform a reindex for that ticket.
- **Ticket Closure**: When a ticket hits the solved or pending state, it will be automatically closed after 24hours (unless a new message comes in). 
- **Followup**: When a ticket is transitioned to Followup, it must goes back to "working" state after the specified period of time.
- **Sync Queue Counters**: every time a Ticket is added or removed from a Queue, we must update the UI counters of that Queue (so agents instantly see the numbers of tickets growing in the queues).

### Kafka Consumers

Other types of async operations are realtime events from Kafka.

Message Service heavily relies on them to pull new messages from social networks or execute rules on Tickets. Here is a detailed list of topics consumed:

- **messages**: Incoming messages from social networks or message-related ops (eg. remove)
- **tickets**: Ticket-related events that might be triggered by rules engine (eg. set state)
- **queue_acks**: special consumer used to re-evaluate all tickets under a Queue when it gets updated
- **ai_messages**: events from AI Chatbot (automatic replies or suggestions)
- **metadata_actions**: detects changes to tag, topic and custom fields in order to update Queue-Ticket associations
- **escalations_outbound**: manages escalation events

## Concurrency and Performance

Since message-service represents a single "point-of-failure" because it's a hub for incoming/outgoing messages that our customers expect to have readily available in the UI as they are produced, over time the service has been tweaked and tuned to increase its throughput capacity to handle A LOT of parallel requests with read/write operations in Mongo, Redis and Kafka.

Current **Kafka Consumer Configuration** is as follows:
```
config.concurrency = 5      # 5 threads per process (to enable parallelism)
config.max_messages = 20    # each thread receives a batch of 20 messages

config.max_wait_time = 1000 # Wait for messages at most 1000ms
```

Each active consumer (thread) can pull up to 20 messages per poll().

On average, **processing time per message is around 90ms-200ms**.

So Throughput in a single-threaded environment (dev/stage) is:

| Processing Time | Batch Time | Throughput (msg/sec) | Throughput (msg/min) |
| --------------- | ---------- | -------------------- | -------------------- |
| **90 ms**       | 1.8 sec    | **11.11 msg/s**      | **667 msg/min**      |
| **200 ms**      | 4 sec      | **5 msg/s**          | **300 msg/min**      |

**To process ×5, ×10, or ×20 times faster** we must increase partitions!! Each topic being consumed (for eg. messages) must have at least 3 partitions so that Karafka will assign 1 thread per partition.

Here is the potential throughput in a production environment with concurrency enabled:

| Processing Time | Batch Time | Throughput (msg/sec) | Throughput (msg/min) |
| --------------- | ---------- | -------------------- | -------------------- |
| **90 ms**       | 1.8 s      | **55.56 msg/s**      | **3.333 msg/min**    |
| **200 ms**      | 4 s        | **25 msg/s**         | **1.500 msg/min**    |

## Configurations

These are required env variables:

- Kafka (KAFKA_HOST, KAFKA_REPLICATION_FACTOR)
- MongoDB (MONGODB_HOST, MONGODB_PORT, MONGODB_USERNAME, MONGODB_PASSWORD)
- Redis (REDIS_DB_NUMBER, REDIS_HOST, REDIS_PORT, REDIS_USERNAME, REDIS_PASSWORD, REDIS_CLUSTER, REDIS_SENTINEL_USERNAME, REDIS_SENTINEL_PASSWORD, REDIS_CLUSTER_PORT)
- OpenSearch (OPENSEARCH_HOST, OPENSEARCH_PORT, OPENSEARCH_USERNAME, OPENSEARCH_PASSWORD)
- Application-specific (MESSAGE_SERVICE_ENV, TICKET_CLOSED_AFTER_MINS, SIDEKIQ_MAX_RETRIES, ADMIN_TOKEN_SECRET)
- External services URLs (USER_SERVICE_URL, TICKET_HELPER_SERVICE_URL, AITOOLBOX_SERVICE_URL)

