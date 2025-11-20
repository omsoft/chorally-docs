---
sidebar_position: 0
title: Getting Started
---

# Getting Started

In this handbook you will learn about Chorally Engineering policies and microservices.

This documentation was built for engineers/support team members that work on the platform, and does not contain business jargon or fancy words. Only practical informations that give you an head start and will make 10x faster at dealing with our complexities.

If you’re new to the company, welcome! It’s important that you review at least the "Workflows" and "Architecture" sections in this handbook, so you know what to expect when writing software.

Please note that this handbook may be updated at any time, and it’s up to you to keep abreast of those updates. Reach out to any of your senior peers if you have any questions about the information contained in this handbook.

## Table of Contents

This handbook is divided into three sections:
- [Chorally Overview](platform_overview.md) gives you a brief introductory to core functionalities and use cases.
- [Architecture](architecture.md) dives into the system architecture, data flow and external dependencies.
- [Workflows](workflows.md) describes our development workflow, testing strategy and more.
- [Shared Libraries](shared_libraries.md) are common utilities that are frequently used by backend services.
<!-- - [Tools](tools.md) contains a useful list of resources to inspect & monitor functionalities. -->

## Microservices

Finally, you can explore the nitty-gritty details about each microservice in the network.

| Microservice  | Description | Status |
|-----------------------------------------------------------------------|------------------------------------------------------------------------------------------|-------|
| [Message Service](catalog/message_service/index.md)                           | Stores inbound and outbound messages, tickets, origins and queues.                       | Attivo |
| *work in progress...*                          |                      |  |
<!-- | [Servizio Utenti](user_service/index.md)                              | Gestisce utenti, gruppi e ruoli all'interno di un Identity Server configurabile          | Attivo |
| [Servizio Provisioning](provision_service/main.md)                    | Gestisce il  processo di onboarding e attivazione dei clienti nella piattaforma Chorally | Attivo |
| [Servizio Author](author_service/index.md)                            | Gestisce autori interni ed esterni per il sistema                                        | Attivo |
| [Servizio AddressBook](address_book_service/index.md)                 | Gestisce le informazioni di contatto con possibilità di caricamento in massa          | Attivo |
| [Servizio Account](account_service/index.md)                          | Gestisce gli account dei clienti, inclusa la gestione dello stato e delle date di scadenza | Attivo |
| [Servizio Metadata](metadata_service/index.md)                        | Gestisce configurazioni di metadati, tag, argomenti e campi personalizzati               | Attivo |
| [Servizio Package](package_service/index.md)                          | Gestisce i pacchetti e le istanze per i clienti di easy-chorally                         | Attivo |
| [Servizio Publishing](publishing_service/index.md)                    | Gestisce la creazione, approvazione e pubblicazione di post sui social media             | Attivo |
| [Servizio Rules Engine](rule_engine_service/index.md)                 | Motore di regole basato su Drools per definire, gestire ed eseguire regole di business | Attivo |
| [Servizio Rule](rule_service/index.md)                                | Gestisce regole di risposta automatica basate su giorni lavorativi e orari | Attivo |
| [Servizio Meta](meta_service/index.md)                                | Gestisce i messaggi in entrata e in uscita dai social network Meta (Facebook, Instagram) e Whatsapp | Attivo |
| [Servizio OutBound](outbound_service/index.md)                        | Gestisce la creazione, la gestione e l'invio di template e campagne WhatsApp | Attivo |
| [Servizio Escalation](escalation_service/index.md)                    | Gestisce i flussi di escalation, i dipartimenti e i messaggi all'interno dell'ecosistema | Attivo |
| [Servizio LinkedIn](linkedin_service/index.md)                        | Gestisce l'importazione e la pubblicazione di contenuti per conto di profili aziendali autenticati su LinkedIn | Attivo | -->
<!-- | [Microsoft Office 365 Service](microsoft-office-365-service/index.md) | Gestisce l'integrazione con Microsoft Office 365 per ricevere aggiornamenti in tempo reale delle caselle di posta | Attivo |
| [Servizio Ticket Helper](ticket_helper_service/main.md)               | Gestisce bundle di template e allegati per canali di comunicazione social/messaging, fornendo API per caricare, recuperare e organizzare template e relativi allegati multi-tenant.| Attivo | -->

---

*Ultimo aggiornamento: 2025-10-25*