---
sidebar_position: 40
authors: ["Mattia Orfano"]
tags: [backend, ruby, opensearch, sidekiq, kafka, mongo]
---

# API & Authorization

## Panoramica

Il Message Service espone una serie di API RESTful che consentono di gestire messaggi, ticket, origini e code. Queste API sono progettate per essere utilizzate da applicazioni client che necessitano di interagire con il sistema di gestione dei messaggi. Tutte api agiscono sul tenant dell'utnete corrente che viene prelevato dal token.

Le API sono organizzate in quattro risorse principali:
- **Tickets**: Gestione dei ticket di supporto
- **Messages**: Gestione dei messaggi all'interno dei ticket
- **Origins**: Gestione delle origini dei messaggi (canali di comunicazione)
- **Queues**: Gestione delle code di lavoro

## Autenticazione

Tutte le API richiedono l'autenticazione tramite token **JWT** (JSON Web Token) o **Custom Token** (server-to-server). Il token deve essere incluso nell'header `Authorization` di ogni richiesta.

```
Authorization: Bearer <token>
Authorization: Token <token>.<tenant>
```

Il token JWT contiene informazioni sull'utente corrente, inclusi il tenant e i ruoli, e viene emesso dall'IdP Keycloak. Mentre il custom token è un secret che entrambi i servizi devono conoscere.

every web request with a JWT token is validated against Keycloak certificates. If signature is valid, the request is authorized.

## Endpoint API

### Tickets API

#### Recupero di tutti i ticket

```
GET /v1/tickets
```

**Parametri**:
- `page`: Numero di pagina (obbligatorio)
- `per_page`: Numero di elementi per pagina (obbligatorio)
- `queue`: ID della coda (opzionale)
- `state`: Stato del ticket (opzionale)
- `author`: Autore del ticket (opzionale)
- `channel`: Canale di comunicazione (opzionale)
- `origin_id`: ID dell'origine (opzionale)
- `sort`: Campo di ordinamento (opzionale)

**Risposta**:
```json
{
  "queue": { "id": "5f7b5b5b5b5b5b5b5b5b5b5b", "name": "Support Queue" },
  "pagination": {
    "total_count": 100,
    "total_pages": 10,
    "current_page": 1,
    "per_page": 10
  },
  "items": [
    {
      "id": "5f7b5b5b5b5b5b5b5b5b5b5b",
      "group": "support",
      "owner": "user123",
      "owner_name": "Mario Rossi",
      "title": "Richiesta di assistenza",
      "received_at": "2023-01-01T12:00:00Z",
      "sentiment": "neutral",
      "sequence": 1,
      "outbound": false,
      "is_conversation": true,
      "state": "working",
      "last_message_received_at": "2023-01-01T12:00:00Z",
      "last_customer_received_at": "2023-01-01T12:00:00Z",
      "count_visible_messages": 3
    }
  ]
}
```

#### Recupero di un singolo ticket

```
GET /v1/tickets/:id
```

**Parametri**:
- `id`: ID del ticket (obbligatorio)

**Risposta**:
```json
{
  "id": "5f7b5b5b5b5b5b5b5b5b5b5b",
  "group": "support",
  "owner": "user123",
  "owner_name": "Mario Rossi",
  "title": "Richiesta di assistenza",
  "received_at": "2023-01-01T12:00:00Z",
  "sentiment": "neutral",
  "sequence": 1,
  "outbound": false,
  "is_conversation": true,
  "state": "working",
  "last_message_received_at": "2023-01-01T12:00:00Z",
  "last_customer_received_at": "2023-01-01T12:00:00Z",
  "count_visible_messages": 3
}
```

#### Aggiunta di una nota a un ticket

```
POST /v1/tickets/:id/notes
```

**Parametri**:
- `id`: ID del ticket (obbligatorio)
- `body`: Contenuto della nota (obbligatorio)
- `note`: Deve essere `true` (obbligatorio)

**Risposta**:
```json
{
  "id": "5f7b5b5b5b5b5b5b5b5b5b5b",
  "author": "user123",
  "author_name": "Mario Rossi",
  "body": "Nota interna",
  "received_at": "2023-01-01T12:00:00Z",
  "note": true
}
```

#### Escalation di un ticket

```
POST /v1/tickets/:id/escalate
```

**Parametri**:
- `id`: ID del ticket (obbligatorio)
- `body`: Contenuto del messaggio di escalation (obbligatorio)
- `thread`: ID del thread (obbligatorio)
- `expiration`: Numero di ore dopo le quali il ticket tornerà allo stato di lavorazione (obbligatorio)
- `flow_id`: ID del flusso (opzionale)
- `emails`: Array di email (opzionale)
- `emails_cc`: Array di email in copia (opzionale)

**Risposta**:
```json
{
  "id": "5f7b5b5b5b5b5b5b5b5b5b5b",
  "state": "escalated",
  "group": "support",
  "owner": "user123",
  "owner_name": "Mario Rossi"
}
```

#### Aggiornamento di un ticket

```
PATCH /v1/tickets/:id
```

**Parametri**:
- `id`: ID del ticket (obbligatorio)
- `group`: Gruppo assegnato (opzionale)
- `owner`: Proprietario (opzionale)
- `owner_name`: Nome del proprietario (opzionale)
- `sentiment`: Sentimento del ticket (opzionale)
- `salesforce`: Flag per sincronizzare con Salesforce (opzionale)

**Risposta**:
```json
{
  "id": "5f7b5b5b5b5b5b5b5b5b5b5b",
  "group": "support",
  "owner": "user123",
  "owner_name": "Mario Rossi",
  "sentiment": "positive"
}
```

#### Impostazione di un ticket in followup

```
PATCH /v1/tickets/:id/followup
```

**Parametri**:
- `id`: ID del ticket (obbligatorio)
- `datetime`: Data e ora del followup (obbligatorio)

**Risposta**:
```json
{
  "id": "5f7b5b5b5b5b5b5b5b5b5b5b",
  "state": "followedup",
  "followed_up_to": "2023-01-10T12:00:00Z"
}
```

#### Risoluzione di un ticket

```
PATCH /v1/tickets/:id/solve
```

**Parametri**:
- `id`: ID del ticket (obbligatorio)
- `salesforce`: Flag per sincronizzare con Salesforce (opzionale)

**Risposta**:
```json
{
  "id": "5f7b5b5b5b5b5b5b5b5b5b5b",
  "state": "solved"
}
```

#### Reset dello stato di un ticket a "created"

```
PATCH /v1/tickets/:id/reset
```

**Parametri**:
- `id`: ID del ticket (obbligatorio)

**Risposta**:
```json
{
  "id": "5f7b5b5b5b5b5b5b5b5b5b5b",
  "state": "created"
}
```

### Messages API

#### Recupero dei messaggi di un ticket

```
GET /v1/tickets/:id/messages
```

**Parametri**:
- `id`: ID del ticket (obbligatorio)

**Risposta**:
```json
{
  "ai_suggestions": [
    {
      "id": "5f7b5b5b5b5b5b5b5b5b5b5b",
      "body": "Suggerimento IA",
      "created_at": "2023-01-01T12:00:00Z"
    }
  ],
  "items": [
    {
      "id": "5f7b5b5b5b5b5b5b5b5b5b5b",
      "author": "user123",
      "author_name": "Mario Rossi",
      "body": "Messaggio di risposta",
      "received_at": "2023-01-01T12:00:00Z",
      "is_operator_reply": true,
      "attachments": []
    }
  ]
}
```

#### Invio di una risposta

```
POST /v1/tickets/:id/messages
```

**Parametri**:
- `id`: ID del ticket (obbligatorio)
- `reply_to`: ID del messaggio a cui si risponde (obbligatorio)
- `reply_kind`: Tipo di risposta (opzionale, default: "reply")
- `thread`: ID esterno della conversazione (obbligatorio)
- `origin_id`: ID dell'origine (obbligatorio)
- `body`: Contenuto del messaggio (opzionale)
- `template_id`: ID del template utilizzato (opzionale)
- `attachments`: Array di chiavi uniche che identificano oggetti su MinIO (opzionale)
- `external_author_name`: Nome dell'autore da un servizio esterno (opzionale)

**Risposta**:
```json
{
  "id": "5f7b5b5b5b5b5b5b5b5b5b5b",
  "author": "user123",
  "author_name": "Mario Rossi",
  "body": "Messaggio di risposta",
  "received_at": "2023-01-01T12:00:00Z",
  "is_operator_reply": true,
  "attachments": []
}
```

#### Nascondere o mostrare un messaggio

```
PUT /v1/tickets/:id/messages/:message_id/hide
```

**Parametri**:
- `id`: ID del ticket (obbligatorio)
- `message_id`: ID del messaggio (obbligatorio)

**Risposta**:
```json
{
  "id": "5f7b5b5b5b5b5b5b5b5b5b5b",
  "hidden": true
}
```

#### Eliminazione di un messaggio

```
DELETE /v1/tickets/:id/messages/:message_id
```

**Parametri**:
- `id`: ID del ticket (obbligatorio)
- `message_id`: ID del messaggio (obbligatorio)

**Risposta**:
```json
{
  "id": "5f7b5b5b5b5b5b5b5b5b5b5b",
  "deleted": true
}
```

### Origins API

#### Recupero di tutte le origini

```
GET /v1/origins
```

**Parametri**:
- `page`: Numero di pagina (obbligatorio)
- `per_page`: Numero di elementi per pagina (obbligatorio)
- `channel`: Filtro per canale (opzionale)
- `publishing`: Filtro per origini di pubblicazione (opzionale)

**Risposta**:
```json
{
  "pagination": {
    "total_count": 10,
    "total_pages": 1,
    "current_page": 1,
    "per_page": 10
  },
  "origins": [
    {
      "id": "5f7b5b5b5b5b5b5b5b5b5b5b",
      "name": "Facebook Page",
      "external_id": "123456789",
      "owner": "tenant1",
      "kind": "facebook_public",
      "channel": "facebook",
      "active": true,
      "public": true,
      "outbound": true,
      "capabilities": {
        "forward": true,
        "like": true,
        "moderate": true,
        "move_to_private": true,
        "chars": 2000
      },
      "description": "Pagina Facebook aziendale"
    }
  ]
}
```

#### Creazione di un'origine

```
POST /v1/origins
```

**Parametri**:
- `name`: Nome dell'origine (obbligatorio)
- `external_id`: ID esterno (opzionale)
- `owner`: Proprietario (obbligatorio)
- `kind`: Tipo di origine (obbligatorio)
- `public`: Flag pubblico (obbligatorio, default: true)
- `capabilities`: Capacità dell'origine (obbligatorio)
  - `forward`: Flag per l'inoltro (opzionale)
  - `like`: Flag per il like (opzionale)
  - `moderate`: Flag per la moderazione (opzionale)
  - `move_to_private`: Flag per spostare in privato (opzionale)
  - `chars`: Numero massimo di caratteri (opzionale, default: 0)
- `description`: Descrizione (opzionale)

**Risposta**:
```json
{
  "id": "5f7b5b5b5b5b5b5b5b5b5b5b",
  "name": "Facebook Page",
  "external_id": "123456789",
  "owner": "tenant1",
  "kind": "facebook_public",
  "channel": "facebook",
  "active": true,
  "public": true,
  "outbound": true,
  "capabilities": {
    "forward": true,
    "like": true,
    "moderate": true,
    "move_to_private": true,
    "chars": 2000
  },
  "description": "Pagina Facebook aziendale"
}
```

#### Aggiornamento dei tempi di chiusura per le origini

```
PATCH /v1/origins/schedule_close
```

**Parametri**:
- `kind`: Tipo di origine (obbligatorio)
- `close_after_wait`: Ore dopo le quali chiudere i ticket in attesa (obbligatorio)
- `close_after_solve`: Ore dopo le quali chiudere i ticket risolti (obbligatorio)

**Risposta**:
```
Status: 200 OK
```

#### Recupero di un'origine specifica

```
GET /v1/origins/:id
```

**Parametri**:
- `id`: ID dell'origine (obbligatorio)

**Risposta**:
```json
{
  "id": "5f7b5b5b5b5b5b5b5b5b5b5b",
  "name": "Facebook Page",
  "external_id": "123456789",
  "owner": "tenant1",
  "kind": "facebook_public",
  "channel": "facebook",
  "active": true,
  "public": true,
  "outbound": true,
  "capabilities": {
    "forward": true,
    "like": true,
    "moderate": true,
    "move_to_private": true,
    "chars": 2000
  },
  "description": "Pagina Facebook aziendale"
}
```

#### Attivazione o disattivazione di un'origine

```
PATCH /v1/origins/:id/toggle_status
```

**Parametri**:
- `id`: ID dell'origine (obbligatorio)
- `active`: Stato attivo (obbligatorio)

**Risposta**:
```json
{
  "id": "5f7b5b5b5b5b5b5b5b5b5b5b",
  "active": true
}
```

#### Eliminazione di un'origine

```
DELETE /v1/origins/:id
```

**Parametri**:
- `id`: ID dell'origine (obbligatorio)

**Risposta**:
```json
{
  "id": "5f7b5b5b5b5b5b5b5b5b5b5b"
}
```

### Queues API

#### Recupero delle code visibili all'utente corrente

```
GET /v1/queues/visible_queues
```

**Parametri**:
- `page`: Numero di pagina (opzionale, default: 1)
- `per_page`: Numero di elementi per pagina (opzionale, default: 10)
- `sort`: Campo di ordinamento (opzionale, default: "order")
- `groups`: Array di gruppi (opzionale)

**Risposta**:
```json
{
  "static_queues": [
    {
      "id": "5f7b5b5b5b5b5b5b5b5b5b5b",
      "name": "Coda Statica",
      "tickets_count": 5
    }
  ],
  "pagination": {
    "total_count": 10,
    "total_pages": 1,
    "current_page": 1,
    "per_page": 10
  },
  "queues": [
    {
      "id": "5f7b5b5b5b5b5b5b5b5b5b5b",
      "name": "Coda di Supporto",
      "tickets_count": 15
    }
  ]
}
```

#### Recupero di tutte le code di lavoro

```
GET /v1/queues
```

**Parametri**:
- `page`: Numero di pagina (obbligatorio)
- `per_page`: Numero di elementi per pagina (obbligatorio)

**Risposta**:
```json
{
  "pagination": {
    "total_count": 10,
    "total_pages": 1,
    "current_page": 1,
    "per_page": 10
  },
  "queues": [
    {
      "id": "5f7b5b5b5b5b5b5b5b5b5b5b",
      "name": "Coda di Supporto",
      "description": "Coda per richieste di supporto",
      "owner": "tenant1",
      "order": 1,
      "groups": ["support"],
      "users": ["user123"],
      "status": true,
      "rules": [],
      "counters": [
        {
          "name": "In lavorazione",
          "states": ["working"]
        }
      ]
    }
  ]
}
```

#### Creazione di una coda di lavoro

```
POST /v1/queues
```

**Parametri**:
- `name`: Nome della coda (opzionale)
- `description`: Descrizione (opzionale)
- `order`: Ordine (opzionale)
- `groups`: Array di gruppi (opzionale)
- `users`: Array di utenti (opzionale)
- `status`: Stato (opzionale)
- `rules`: Array di regole (opzionale)
- `counters`: Array di contatori (opzionale)
  - `name`: Nome del contatore (obbligatorio)
  - `states`: Array di stati (opzionale)

**Risposta**:
```json
{
  "id": "5f7b5b5b5b5b5b5b5b5b5b5b",
  "name": "Coda di Supporto",
  "description": "Coda per richieste di supporto",
  "owner": "tenant1",
  "order": 1,
  "groups": ["support"],
  "users": ["user123"],
  "status": true,
  "rules": [],
  "counters": [
    {
      "name": "In lavorazione",
      "states": ["working"]
    }
  ]
}
```

#### Recupero di una singola coda di lavoro

```
GET /v1/queues/:id
```

**Parametri**:
- `id`: ID della coda (obbligatorio)

**Risposta**:
```json
{
  "id": "5f7b5b5b5b5b5b5b5b5b5b5b",
  "name": "Coda di Supporto",
  "description": "Coda per richieste di supporto",
  "owner": "tenant1",
  "order": 1,
  "groups": ["support"],
  "users": ["user123"],
  "status": true,
  "rules": [],
  "counters": [
    {
      "name": "In lavorazione",
      "states": ["working"]
    }
  ]
}
```

#### Aggiornamento di una coda di lavoro

```
PATCH /v1/queues/:id
```

**Parametri**:
- `id`: ID della coda (obbligatorio)
- `name`: Nome della coda (opzionale)
- `description`: Descrizione (opzionale)
- `order`: Ordine (opzionale)
- `groups`: Array di gruppi (opzionale)
- `users`: Array di utenti (opzionale)
- `status`: Stato (opzionale)
- `rules`: Array di regole (opzionale)
- `counters`: Array di contatori (opzionale)
  - `name`: Nome del contatore (obbligatorio)
  - `states`: Array di stati (opzionale)

**Risposta**:
```json
{
  "id": "5f7b5b5b5b5b5b5b5b5b5b5b",
  "name": "Coda di Supporto Aggiornata",
  "description": "Coda per richieste di supporto",
  "owner": "tenant1",
  "order": 1,
  "groups": ["support"],
  "users": ["user123"],
  "status": true,
  "rules": [],
  "counters": [
    {
      "name": "In lavorazione",
      "states": ["working"]
    }
  ]
}
```

#### Eliminazione di una coda di lavoro

```
DELETE /v1/queues/:id
```

**Parametri**:
- `id`: ID della coda (obbligatorio)

**Risposta**:
```json
{
  "id": "5f7b5b5b5b5b5b5b5b5b5b5b"
}
```

### Mass Actions API

#### Risposta di massa con template

```
PATCH /v1/tickets/mass_reply
```

**Parametri**:
- `ticket_ids`: Array di ID dei ticket (obbligatorio)
- `template_id`: ID del template (obbligatorio)

**Risposta**:
```json
{
  "success": true,
  "count": 5
}
```

#### Cambio di stato di massa

```
PATCH /v1/tickets/mass_state_change
```

**Parametri**:
- `ticket_ids`: Array di ID dei ticket (obbligatorio)
- `state`: Nuovo stato (obbligatorio)

**Risposta**:
```json
{
  "success": true,
  "count": 5
}
```

#### Assegnazione di massa del proprietario

```
PATCH /v1/tickets/mass_owner_change
```

**Parametri**:
- `ticket_ids`: Array di ID dei ticket (obbligatorio)
- `owner`: Nuovo proprietario (obbligatorio)
- `owner_name`: Nome del nuovo proprietario (opzionale)

**Risposta**:
```json
{
  "success": true,
  "count": 5
}
```

#### Assegnazione di massa del gruppo

```
PATCH /v1/tickets/mass_group_change
```

**Parametri**:
- `ticket_ids`: Array di ID dei ticket (obbligatorio)
- `group`: Nuovo gruppo (obbligatorio)

**Risposta**:
```json
{
  "success": true,
  "count": 5
}
```

## Gestione degli Errori

Le API restituiscono codici di stato HTTP standard per indicare il successo o il fallimento di una richiesta:

- **200 OK**: La richiesta è stata completata con successo
- **201 Created**: La risorsa è stata creata con successo
- **400 Bad Request**: La richiesta non è valida
- **401 Unauthorized**: L'autenticazione è fallita
- **403 Forbidden**: L'utente non ha i permessi necessari
- **404 Not Found**: La risorsa richiesta non è stata trovata
- **422 Unprocessable Entity**: La richiesta è valida ma non può essere elaborata

In caso di errore, la risposta includerà un oggetto JSON con dettagli sull'errore:

```json
{
  "error": "Messaggio di errore"
}
```

Oppure, in alcuni casi, un documento ProblemDetails conforme a RFC 7807:

```json
{
  "status": 400,
  "detail": "Messaggio di errore dettagliato"
}
```

## Esempi di Utilizzo

### Esempio 1: Recupero di tutti i ticket in una coda specifica

```
GET /v1/tickets?page=1&per_page=10&queue=5f7b5b5b5b5b5b5b5b5b5b5b
```

### Esempio 2: Invio di una risposta a un messaggio

```
POST /v1/tickets/5f7b5b5b5b5b5b5b5b5b5b5b/messages
```

Corpo della richiesta:
```json
{
  "reply_to": "5f7b5b5b5b5b5b5b5b5b5b5b",
  "thread": "ext-123456",
  "origin_id": "5f7b5b5b5b5b5b5b5b5b5b5b",
  "body": "Grazie per la tua richiesta. Stiamo lavorando per risolvere il problema."
}
```

### Esempio 3: Creazione di una nuova origine

```
POST /v1/origins
```

Corpo della richiesta:
```json
{
  "name": "Instagram Business",
  "external_id": "instagram-123456",
  "owner": "tenant1",
  "kind": "instagram_comment",
  "public": true,
  "capabilities": {
    "like": true,
    "moderate": true,
    "chars": 2200
  },
  "description": "Account Instagram aziendale"
}
```

### Esempio 4: Aggiornamento di una coda di lavoro

```
PATCH /v1/queues/5f7b5b5b5b5b5b5b5b5b5b5b
```

Corpo della richiesta:
```json
{
  "name": "Coda Prioritaria",
  "order": 1,
  "groups": ["support", "sales"],
  "status": true,
  "counters": [
    {
      "name": "Urgenti",
      "states": ["working", "pending"]
    }
  ]
}
```