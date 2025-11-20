---
sidebar_position: 4
title: Shared Libraries
authors: []
---

# Shared Libraries

Since there are so many interconnected services with different data structures and API designs (especially with social media providers subject to frequent API changes and deprecations), we strive towards simplicity by adding abstraction layers.

An abstraction layer might be a Java library, a Ruby gem, an Angular component or an entire microservice that acts as a HUB between the receiver and the sender.

The goal is to normalize input and output data so that when things change, and they do, we don't have to update 30+ microservices.

Here are common utilities we developed so far.

### Social Media Libraries
- **Linkedin V2 Ruby gem**: this is a wrapper for Linkedin V2 APIs used by Linkedin Service. If or when Linkedin will transition to V3 apis or a completely new set of APIs, we can easily swap this wrapper and keep the Linkedin Service intact.. with no changes to its endpoints, parameters and output design.

- **Ticket-Helper**: this is a wrapper for S3/MinIO to fetch or upload binary files. It's frequently used by I/O services to import or export attachments and store metadata informations.

- *work in progess...*
