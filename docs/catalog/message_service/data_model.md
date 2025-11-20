---
sidebar_position: 30
title: Data Model
authors: ["Mattia Orfano"]
tags: [backend, ruby, opensearch, sidekiq, kafka, mongo]
---

Message Service uses MongoDB as its primary database engine and stores the following collections:

1. **Messages**: Represents individual communications between customers and agents (AiMessage and AiSuggestion are subtypes)
2. **Threads**: Represents messages tied to a conversation with a customer
3. **Tickets**: Represents support cases with customers
4. **Origins**: Represents communication channels (social media, messaging platforms, etc)
5. **Queues**: Used to group tickets together when they meet certain criteria

In addition, there are embedded documents:

- **QueueCounters**: Embedded in Queue, to track the number of tickets by state
- **TicketStateTransitions**: Embedded in Tickets, to track state changes and events

## Collections

### Messages

**Fields:**

- `_id`: ObjectId (MongoDB identifier)
- `author`: String (identifier of the author from social media platforms)
- `author_name`: String (name of the author)
- `body`: String (message content)
- `external_id`: String (identifier of the message from social media platforms)
- `reply_to`: String (external_if of the message being replied to)
- `reply_kind`: StringifiedSymbol (type of reply: retweet, quote, reply, responder, bump)
- `attachments`: Array (list of attachments)
- `received_at`: DateTime (when message was received)
- `note`: Boolean (whether its a private note)
- `extra`: Hash (additional custom properties)
- `shadowed`: Boolean (whether the message was hidden from Chorally agents because Origin has been disabled)
- `hidden`: Boolean (whether the message was hidden from social media)
- `deleted`: Boolean (whether the message was deleted from social media)
- `is_operator_reply`: Boolean (whether the message is an agent reply)
- `is_escalation`: Boolean (whether is an escalation)
- `is_external_reply`: Boolean (whether comes from external API)
- `template_id`: String (templates used for message content)
- `origin_id`: String (identifier of the Origin)
- `created_at`: DateTime (when document was created)
- `updated_at`: DateTime (when document was updated)

**Relazioni:**

- Appartiene a un Thread (opzionale)
- Appartiene a un Ticket

**Indici:**

- `ticket_id`: Per interrogazioni efficienti dei messaggi per ticket
- `shadowed`: Per filtrare i messaggi nascosti
- `hidden`: Per filtrare i messaggi nascosti
- `deleted`: Per filtrare i messaggi eliminati
- `is_operator_reply`: Per filtrare le risposte degli operatori
- `is_external_reply`: Per filtrare le risposte esterne
- `is_escalation`: Per filtrare i messaggi di escalation

**Ricerca:**

- Utilizza Searchkick per la ricerca full-text e l'indicizzazione

### Collezione AiMessages

Sottoclasse di Messages che rappresenta contenuti generati dall'IA.

**Campi Aggiuntivi:**

- Eredita tutti i campi da Messages
- Può contenere campi specifici per l'IA

**Relazioni:**

- Stesse di Messages

### Collezione Threads

Raggruppa messaggi correlati in una conversazione.

**Campi:**

- `_id`: ObjectId (identificatore documento MongoDB)
- `external_id`: String (identificatore dal sistema esterno)
- `body`: String (contenuto del thread)
- `attachment_urls`: Array (lista di URL degli allegati)

**Relazioni:**

- Appartiene a una Origin
- Ha molti Messages

**Indici:**

- `external_id` e `origin_id`: Indice unico per l'identificazione del thread

### Collezione Tickets

Rappresenta i casi di supporto clienti contenenti messaggi.

**Campi:**

- `_id`: ObjectId (identificatore documento MongoDB)
- `group`: String (gruppo assegnato al ticket)
- `owner`: String (proprietario del ticket)
- `owner_name`: String (nome del proprietario)
- `title`: String (titolo del ticket)
- `received_at`: DateTime (quando il ticket è stato ricevuto)
- `sentiment`: StringifiedSymbol (sentimento del ticket: negative, neutral, positive, not_assigned)
- `sequence`: Integer (numero sequenziale del ticket)
- `outbound`: Boolean (indica se il ticket è stato creato per un messaggio in uscita)
- `is_conversation`: Boolean (indica se il ticket è una conversazione)
- `followed_up_to`: DateTime (data fino a cui il ticket è stato seguito)
- `author`: String (autore denormalizzato)
- `last_message_received_at`: DateTime (quando è stato ricevuto l'ultimo messaggio)
- `last_customer_received_at`: DateTime (quando è stato ricevuto l'ultimo messaggio del cliente)
- `count_visible_messages`: Integer (conteggio dei messaggi visibili)
- `state`: String (stato del ticket: created, replied, closed, followedup, solved, pending, working)
- `closed_at`: DateTime (quando il ticket è stato chiuso)
- `created_at`: DateTime (quando il documento è stato creato)
- `updated_at`: DateTime (quando il documento è stato aggiornato l'ultima volta)

**Relazioni:**

- Appartiene a una Origin
- Ha molti Messages
- Ha molti AiSuggestions
- Ha molti AiMessages
- Ha e appartiene a molte Queues
- Incorpora molti TicketStateTransitions

**Indici:**

- `created_at`: Per ordinare per data di creazione
- `updated_at`: Per ordinare per data di aggiornamento
- `outbound`: Per filtrare i ticket in uscita
- `last_message_received_at`: Per ordinare per data dell'ultimo messaggio

**Macchina a Stati:**

- Implementa una macchina a stati per gli stati dei ticket
- Stati: created, replied, closed, followedup, solved, pending, working
- Le transizioni tra stati sono gestite dal concern TicketStateMachine

### Collezione Origins

Rappresenta i canali di comunicazione da cui provengono i messaggi.

**Campi:**

- `_id`: ObjectId (identificatore documento MongoDB)
- `name`: String (nome dell'origine)
- `external_id`: String (identificatore dal sistema esterno)
- `owner`: String (proprietario dell'origine)
- `kind`: StringifiedSymbol (tipo di origine: facebook_public, instagram_comment, x_mention, ecc.)
- `channel`: StringifiedSymbol (canale: facebook, instagram, whatsapp, x, ecc.)
- `active`: Boolean (indica se l'origine è attiva)
- `public`: Boolean (indica se l'origine è pubblica)
- `outbound`: Boolean (indica se l'origine supporta messaggi in uscita)
- `capabilities`: Hash (capacità dell'origine)
- `description`: String (descrizione dell'origine)
- `locking_name`: String (nome per il blocco)
- `locked_at`: Time (quando l'origine è stata bloccata)
- `close_after_solve`: Integer (ore dopo le quali chiudere i ticket risolti)
- `close_after_wait`: Integer (ore dopo le quali chiudere i ticket in attesa)

**Relazioni:**

- Ha molti Threads
- Ha molti Tickets

**Indici:**

- `external_id`, `owner`, e `kind`: Indice unico per l'identificazione dell'origine

### Collezione Queues

Organizza i ticket in base a regole specifiche.

**Campi:**

- `_id`: ObjectId (identificatore documento MongoDB)
- `name`: String (nome della coda)
- `description`: String (descrizione della coda)
- `owner`: String (proprietario della coda)
- `order`: Integer (ordine di visualizzazione)
- `groups`: Array (gruppi associati alla coda)
- `users`: Array (utenti associati alla coda)
- `status`: Boolean (stato della coda)
- `rules`: Array (regole per la coda)
- `rule`: String (ID della regola dal rule-engine)
- `created_at`: DateTime (quando il documento è stato creato)
- `updated_at`: DateTime (quando il documento è stato aggiornato l'ultima volta)

**Relazioni:**

- Ha e appartiene a molti Tickets
- Incorpora molti QueueCounters

**Documenti Incorporati:**

- QueueCounters: Traccia il numero di ticket in ogni stato

### Documenti Incorporati

#### QueueCounter

Incorporato nelle Queues per tracciare il conteggio dei ticket per stato.

**Campi:**

- `_id`: ObjectId (identificatore documento MongoDB)
- `name`: String (nome del contatore)
- `states`: Array (stati da contare)

#### TicketStateTransition

Incorporato nei Tickets per tracciare i cambiamenti di stato.

**Campi:**

- `_id`: ObjectId (identificatore documento MongoDB)
- `namespace`: String (namespace dell'evento)
- `event`: String (evento che ha causato la transizione)
- `from`: String (stato prima della transizione)
- `to`: String (stato dopo la transizione)
- `created_at`: DateTime (quando è avvenuta la transizione)

## Panoramica delle Relazioni

1. **Origin → Ticket → Message**:
   - Una Origin ha molti Tickets
   - Un Ticket ha molti Messages
   - Un Message appartiene a un Ticket

2. **Origin → Thread → Message**:
   - Una Origin ha molti Threads
   - Un Thread ha molti Messages
   - Un Message può appartenere a un Thread (opzionale)

3. **Ticket ↔ Queue**:
   - Un Ticket può appartenere a molte Queues
   - Una Queue può contenere molti Tickets
   - Una Queue incorpora molti QueueCounters per tracciare i conteggi

4. **Ticket → TicketStateTransition**:
   - Un Ticket incorpora molti TicketStateTransitions che registrano i cambiamenti di stato

## Indicizzazione e Ricerca

- I Messages sono indicizzati utilizzando Searchkick per la ricerca full-text
- Vari indici sono definiti sulle collezioni per interrogazioni efficienti
- I dati di ricerca per i messaggi includono informazioni denormalizzate dai ticket e dalle origini correlate
