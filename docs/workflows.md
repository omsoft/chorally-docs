---
sidebar_position: 3
title: Workflows
---

# Workflows

This page describes the development workflow and best practises from inception to submission of merge requests. They make it easy to promote code changes to production, ensuring code quality and readability.

## 1. Bug Reports & Technical Support

Chorally undertakes several measures to push product forward, providing the best customer experience possible. There are currenly 3 tiers of technical support, each with different levels of complexity.

- **Level 1**: Collects customer requests and data, conducts basic troubleshooting and solve common problems such as username and passwords issues, menu navigation, verification of hardware and software, installation issues, and setup.
- **Level 2**: Provides in-depth troubleshooting and backend analysis to determine what the client issue is, collect technical details and contextual data for further inspection.
- **Level 3**: The core engineering team leads the product development and provides solutions for a wide variety of technical problems when they arise and cannot be solved by Level 1/2.

### Guidelines
**For Level 1 and 2:** Bug reports MUST include steps to reproduce, application logs (trimmed at a specific timestamp), expected behavior, tenant name and URL, exact page/section where issue appeared and (optional) contextual data about who faced the issue with screenshots.

**For Level 3:** Before jumping into a bugfix, make sure the issue has been throughly analize by Level 1/2 and they gave you all basic informations to proceed as quickly as possible into the resolution

## 2. Development Workflow

### Main Branches
At any given point there are at least 2 active branches:
- **main** is our stable branch with production-ready features. Every new push to main branch updates the staging environment.
- **dev** is our playground where magic happens. Every new push to dev branch updates the development environment.

But **no direct merges** to dev/main are allowed. You're expected to work on **parallel branches** regularly rebased and short-lived.

### Supporting Branches

Next to dev/main branches, we use a variety of branches to aid parallel development between team members, ease tracking of features, prepare for production releases and to push urgent bugfixes. Unlike the main ones, these branches have a limited life time, since they will be removed after the merge request is approved.

We may use:

- Feature branches
- Release branches
- Hotfix branches

### Git Flow
- Always branch from **dev** unless explicitly instructed otherwise.
- **One Merge Request = One Jira Ticket**
  - The Jira ticket ID must appear in the branch name, and the merge request title/description.
  - There are only 2 exceptions:
    - Hotfixes without a Jira ticket require an immediate follow-up ticket documenting the root cause and fix.
    - Bulk refactors require a dedicated technical task in Jira to maintain traceability.
- Use **clear branch naming**:
  ```
    feature/[ticket-number]-[short-description]
    bugfix/[ticket-number]-[short-description]
    hotfix/[ticket-number]-[short-description]
  ```
- Avoid long-living branches; keep changes small and focused.
- Commit early, commit often, but **keep commit messages meaningful** (avoid "fixes", "small change", "wip", ...)
- **Rebase your branch on dev before opening a PR to avoid noisy diffs.**
- Resolve conflicts locally; never push broken merge states.
- Delete branches after merge to keep repository clean.
- Do not commit secrets, large files, or environment-specific configs.

### Code Review Guidelines
- **Code reviews are mandatory**. No merges without at least **1 peer review**
  - when you're done with the development, create a MR to dev and send link for review
- **Small PRs!** Aim for < 300 lines of diff whenever possible.
- Title MUST contain a reference to Jira Ticket (`SE-59: Linkedin Comments`)
- Description MUST contain a human readable changelog. For example:
  ```
  - Increased throughput of Kafka events by reducing latency of read/write operations
  - Tickets collection is now sorted alphabetically
  ```
- **Verify locally before requesting review**.
  - We've all been there. Development ain't easy and sometimes little distractions are part of the process. But avoid wasting time of peers and potentially letting bugs leak into production by conducting end-to-end tests (be creative, use Postman)
- Reviewers focus on: correctness, clarity, performance, security, and impact.
- After approval, the author merges the PR unless the team defines otherwise.

### Testing Strategy and QA Process
- Every feature must include automated tests covering:
  - Unit tests for logic
  - Integration tests for external boundaries
  - End-to-end tests when workflows are impacted

- Use mocks for data structures you don't own (e.g., 3rd-party SDK internals).
- **Maintain >80% coverage** as a guideline
- QA validates in staging first; keep an eye on Jira for feedbacks on your tickets.
- No deployment allowed with failing tests

### Documentation and Knowledge Sharing
Chorally architecture is complex and every decision in your codebase matters because it may impact performance of the entire ecosystem, or require adaption from other interconnected microservices.

Even though small changes that don't affect workflow or external dependencies can be applied without approval from a senior engineer, make sure to inform others of your choice and keep documentation up to date. Doesn't matter how small the code change is... everything must be reflected in the documentation of that specific service.


### Definition of Done (DoD)
Use the following checklist for every bit of code you produce before hitting "Done" in Jira:

- [x] Is the requested Feature/Bugfix implemented?
- [x] Are tests added?
- [x] Is the documentation updated?
- [x] Are there major lint/test/pipeline failures?
- [x] Did I open a merge request to dev?
- [x] Did I do end-to-end tests in the development environment?
- [x] Should the configmap/secret in Kubernetes be updated?

## 3. Deployment
We set up CI/CD in order to automatically:
- run linting, tests, security checks and build steps for every commit in dev/main branches
- use environment variables from K8 resources (configMap, secrets)
- CD to staging should be automatic after merge.
- CD to production should be automatic after tagging

### Deploy Checklist
To trigger a new deploy follow these steps:
- [x] Open a QA Tested Jira Ticket and click on "branches" to view list of services involved
- [x] Read Jira comments left from developers to see deployment instructions
- [x] Open GitLab repositories and add new tag
- [x] Wait for CI/CD deployment
- [x] Monitor logs and metrics of each deployed service for at least 30 minutes post-deploy.

---

*Ultimo aggiornamento: 2025-11-17*