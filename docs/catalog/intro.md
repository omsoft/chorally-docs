---
sidebar_position: 10
title: Intro
authors: []
---

# Intro

This page is a guide for maintainers and developers to set up microservices.

## Naming Convention

We follow a naming convention that offers immediate clarity, consistency across the ecosystem, ops benefits and avoid ambiguity. A name should communicates its core responsibility, be easily recognizable across dozens of services, and facilitates devops operations (log streams, CI pipelines and uniform names on dashboards).

Remember that Chorally has 3 separate technical support teams, in addition to DevOps, so not everyone can/should know all details about your service.

### Rule

- All microservices must follow the naming pattern: 
  - `[main-feature]-service` for feature-specific services
  - `[provider-name]-service` for I/O services
- Names must be all lowercase, using hyphens (-) as separators.

Examples

```
notification-service
message-service
billing-service
meta-service
```

### Guidelines

- Keep the descriptor as short as possible while still being precise.
- The suffix -service is mandatory for all deployable backend services.
- Internal shared libraries should not use the -service suffix (e.g., linkedin-v2, java-auth-client).

## When to create a new service

Only when a responsibility cannot be cleanly expressed as part of an existing service.
