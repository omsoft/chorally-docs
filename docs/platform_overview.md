---
sidebar_position: 1
title: Chorally Overview
---

# Chorally Overview


## Introduction

Easy Chorally è una piattaforma completa per la gestione delle comunicazioni digitali e l'engagement sui social media, progettata per aiutare le aziende a gestire efficacemente la loro presenza online attraverso molteplici canali. Questa pagina fornisce una panoramica ad alto livello delle principali funzionalità offerte dalla piattaforma.

## Core Functionalities

### 1. Gestione Omnicanale delle Comunicazioni

Easy Chorally consente di gestire le comunicazioni attraverso diversi canali in un'unica piattaforma integrata:

- **Social Media Management**: Gestione completa di Facebook, Instagram, WhatsApp, LinkedIn, X (con limitazioni), Telegram, YouTube, App Store, Google Play, Google My Business, Mail Providers (google, office365)
- **Sistema di Ticketing**: Organizzazione automatica dei messaggi in ticket per una gestione efficiente
- **Inbox Unificata**: Visualizzazione di tutti i messaggi provenienti da diversi canali e divisione in cartelle (code di lavoro)
- **Ricerca avanzata**: Possibilità di filtrare i messaggi ricevuti o pubblicati su ciascun canale

### 2. Pubblicazione e Pianificazione dei Contenuti

La piattaforma offre strumenti avanzati per la creazione, approvazione e pubblicazione di contenuti sui social media:

- **Editor di Contenuti**: Creazione di post con supporto per testo, immagini, video e altri media
- **Pianificazione**: Programmazione dei post per la pubblicazione automatica in date e orari specifici
- **Flussi di Approvazione**: Gestione dei processi di revisione e approvazione dei contenuti prima della pubblicazione
- **Pubblicazione Multi-canale**: Pubblicazione simultanea su diverse piattaforme social

### 3. Automazione e Intelligenza Artificiale

Easy Chorally integra funzionalità di automazione per migliorare l'efficienza operativa:

- **Motore di Regole**: Definizione di regole di business per automatizzare risposte e azioni
- **Risponditore Automatico**: Gestione di regole di risposta automatica basate su giorni lavorativi del business
- **Instradamento Intelligente**: Assegnazione automatica dei ticket alle code di lavoro e agli agenti più appropriati
- **Analisi del Sentiment**: Valutazione automatica del tono e del sentiment dei messaggi in arrivo
- **Machine Learning**: Analisi degli autori dei messaggi e assegnazione automatica di proprietà al ticket

### 4. Campagne WhatsApp

Funzionalità specializzate per la gestione delle comunicazioni WhatsApp:

- **Gestione Template**: Creazione e gestione di template di messaggi conformi alle linee guida di WhatsApp
- **Campagne Outbound**: Pianificazione e invio di campagne di messaggi WhatsApp a gruppi di contatti
- **Analisi delle Performance**: Monitoraggio dei tassi di consegna, apertura e risposta delle campagne

### 5. Gestione Operatori e Ruoli

Sistema completo per la gestione degli operatori della piattaforma:

- **Gestione Ruoli**: Definizione di ruoli personalizzati con permessi specifici
- **Organizzazione in Team**: Raggruppamento degli utenti in team per abilitare funzionalità specifiche
- **Autenticazione Sicura**: Integrazione con sistemi di identità per un'autenticazione sicura

### 6. Rubrica degli autori

Funzionalità di raccolta dei profili social che scrivono tramite i canali abilitati

- **Rubrica Contatti**: Gestione centralizzata delle informazioni di contatto con possibilità di importazione in massa
- **Campi personalizzati**: Possibilità di salvare informazioni personali a ciascun contatto

### 7. Gestione dei Clienti

Strumenti per la gestione dei clienti e degli account:

- **Onboarding Clienti**: Processo guidato per l'attivazione di nuovi clienti sulla piattaforma
- **Gestione Account**: Monitoraggio dello stato degli account e delle date di scadenza dei contratti

### 8. Escalation e Gestione dei Flussi di Lavoro

Funzionalità per la gestione dei processi di escalation:

- **Flussi di Escalation**: Definizione di percorsi di escalation per problematiche complesse
- **Gestione Dipartimenti**: Organizzazione degli agenti in dipartimenti specializzati
- **Notifiche in Tempo Reale**: Avvisi immediati per situazioni che richiedono attenzione

### 9. Integrazione con Piattaforme Social

Funzionalità per l'integrazione con le sopracitate piattaforme social:

- **Autenticazione OAuth**: Connessione sicura con profili e pagine aziendali tramite OAuth 2.0
- **Gestione Profili**: Salvataggio dei profili amministratori delle pagine aziendali e gestione token OAuth
- **Pubblicazione Contenuti**: Pubblicazione automatica di contenuti tramite API sulle pagine social
- **Importazione di Contenuti**: Gestione delle fonti e apertura automatica dei ticket per ciascun nuovo commento, menzione o recensione ricevuta sulla pagina social

### 10. Analisi e Reportistica

Strumenti analitici per monitorare le performance:

- **Dashboard Personalizzabili**: Visualizzazione di metriche chiave in dashboard configurabili
- **Reportistica Avanzata**: Generazione di report dettagliati su vari aspetti delle operazioni
- **Analisi delle Conversazioni**: Insights sulle interazioni con i clienti e sul sentiment

### 11. Metadati e Personalizzazione

Funzionalità per estendere e personalizzare la piattaforma:

- **Campi Personalizzati**: Definizione di attributi aggiuntivi per entità come ticket, contatti e account
- **Tagging**: Categorizzazione flessibile di contenuti e conversazioni tramite tag
- **Argomenti Gerarchici**: Organizzazione dei contenuti in una struttura gerarchica di argomenti

## Terminologies

- **Account**: Rappresenta un'organizzazione cliente associata ad un contratto commerciale
- **Package**: Pacchetto di funzionalità collegato a uno o più Account
- **Tenant**: Rappresenta il dominio dell'organizzazione cliente per usare la piattaforma
- **User**: Rappresenta gli operatori della piattaforma con i loro ruoli e permessi
- **Group**: Gruppi di utenti all'interno di un tenant per la gestione delle autorizzazioni
- **Ticket**: Rappresenta una conversazione o richiesta da gestire
- **Message**: Messaggi individuali all'interno di un ticket
- **Queue**: Rappresenta una coda di lavoro che racchiudere più tickets in base a regole specifiche
- **Thread**: Rappresenta lo storico di conversazioni di un singolo autore su uno specifico canale
- **Origin**: Canale di comunicazione da cui provengono i messaggi composto dal channel (es. Facebook, WhatsApp) e kind (pubblico, privato, review, ecc)
- **Author**: Contatti esterni con cui l'organizzazione comunica. Sono i profili social che scrivono commenti sulla pagina dell'organizzazione e aprono quindi i ticket in Chorally.
- **Campaign**: Campagne di comunicazione outbound Whatsapp
- **Rule**: Regole di automazione per la gestione dei ticket/messaggi
- **Metadata**: Campi personalizzati per estendere le entità dei ticket o degli autori

### Key Relations

- Un Account è collegato a un Package
- Un Tenant ha molti Users, Groups, Rules, Tickets, Origins, ecc.
- Un Package definisce le capacità per molti Accounts
- Un Ticket contiene molti Messages
- Un Origin può avere molti Tickets
- Un Author può inviare molti Messages
- Un Thread contiene molti Tickets e Messages

## Technology Stack at a Glance

Easy Chorally è costruita su un'architettura a microservizi che garantisce scalabilità, resilienza e flessibilità.

- **Identity Server**: l'accesso alle funzionalità è controllato tramite IdP Keycloak
- **API RESTful**: Tutte le funzionalità sono accessibili tramite API documentate
- **Integrazione con Sistemi Esterni**: Possibilità di integrazione con CRM, sistemi di helpdesk e altre piattaforme aziendali
- **Architettura Multi-tenant**: Supporto per la gestione di più clienti sulla stessa infrastruttura con isolamento dei dati

## Use Cases

Easy Chorally è ideale per diverse esigenze aziendali:

- **Customer Service**: Gestione efficiente del supporto clienti attraverso canali social
- **Marketing Digitale**: Pianificazione e pubblicazione di campagne di marketing sui social media
- **Comunicazione Aziendale**: Gestione centralizzata delle comunicazioni esterne dell'azienda
- **Gestione della Reputazione**: Monitoraggio e risposta rapida a menzioni e commenti sui social media

---

*Ultimo aggiornamento: 2025-11-14*