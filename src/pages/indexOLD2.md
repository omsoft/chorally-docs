# Documentazione Easy Chorally

Questo documento serve come indice per navigare attraverso tutta la documentazione disponibile nel progetto.

## Panoramica della Piattaforma

Per una descrizione ad alto livello delle funzionalità della piattaforma Easy Chorally, consultare la [Panoramica delle Funzionalità](platform_overview.md).

## Architettura del Sistema

Per una panoramica completa dell'architettura del sistema e delle interazioni tra i microservizi, consultare la [Documentazione dell'Architettura](architecture.md).

## Panoramica dei Microservizi

Easy Chorally è composto da diversi microservizi, ognuno con responsabilità specifiche. Di seguito è riportato un elenco di tutti i microservizi disponibili:

| Microservizio                                                         | Descrizione                                                                              | Stato |
|-----------------------------------------------------------------------|------------------------------------------------------------------------------------------|-------|
| [Servizio Messaggi](message_service/index.md)                         | Gestisce i messaggi in ingresso e in uscita e i corrispondenti ticket associati          | Attivo |
| [Servizio Utenti](user_service/index.md)                              | Gestisce utenti, gruppi e ruoli all'interno di un Identity Server configurabile          | Attivo |
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
| [Servizio LinkedIn](linkedin_service/index.md)                        | Gestisce l'importazione e la pubblicazione di contenuti per conto di profili aziendali autenticati su LinkedIn | Attivo |
<!-- | [Microsoft Office 365 Service](microsoft-office-365-service/index.md) | Gestisce l'integrazione con Microsoft Office 365 per ricevere aggiornamenti in tempo reale delle caselle di posta | Attivo |
| [Servizio Ticket Helper](ticket_helper_service/main.md)               | Gestisce bundle di template e allegati per canali di comunicazione social/messaging, fornendo API per caricare, recuperare e organizzare template e relativi allegati multi-tenant.| Attivo | -->

---

*Ultimo aggiornamento: 2025-10-20*