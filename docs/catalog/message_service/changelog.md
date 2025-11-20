---
title: Changelog
---

# Documentazione Generale

## Architettura

Il Servizio Messaggi segue un'architettura modulare con i seguenti componenti:

1. **API**: Costruito con Grape, fornisce endpoint RESTful per i client
2. **Consumers**: Elabora i messaggi Kafka per la comunicazione basata su eventi
3. **Models**: Definisce le entità di dominio e le loro relazioni
4. **Jobs**: Gestisce l'elaborazione asincrona utilizzando Sidekiq
5. **Services**: Contiene la logica di business per le operazioni su ticket, messaggi, origini e code

## Dipendenze

- **MongoDB**: Archivio dati primario per tutte le entità
- **Kafka**: Piattaforma di streaming di eventi per la comunicazione tra servizi
- **Redis**: Utilizzato per l'elaborazione di lavori in background con Sidekiq
- **OpenSearch**: Motore di ricerca per l'indicizzazione e l'interrogazione dei messaggi

## Entità Principali

### Ticket

Un ticket rappresenta un caso di supporto clienti. Contiene:

- Messaggi da clienti e agenti di supporto
- Informazioni sullo stato (creato, in lavorazione, in attesa, followup, risolto, chiuso)
- Informazioni sull'assegnazione (proprietario, gruppo)
- Metadati (sentiment, orario di ricezione, ecc.)

I ticket possono essere organizzati in code (queue) in base a regole.

Alcune proprietà del ticket vengono generate/aggiornate in automatico:
- *sequence* numerica che identifica in modo univoco il ticket all'interno di un tenant
- *valutazione cliente* presa dall'ultima recensione ricevuta (ove possibile, es. Trustpilot)
- *metadati* come orario di apertura, orario ultimo messaggio, orario di chiusura, ecc.

### Messaggio

Un messaggio rappresenta una singola comunicazione all'interno di un ticket. Può essere:

- Messaggio del cliente
- Risposta dell'agente
- Nota interna
- Messaggio generato dall'IA
- Suggerimento generato dall'IA

I messaggi possono includere allegati e possono essere nascosti o eliminati.

I messaggi vengono raggruppati in thread di conversazione in base alla coppia AUTORE-CANALE; questo perché lo stesso utente può scrivere più volte nello stesso canale, anche a distanza di tempo, e Chorally tiene traccia di queste conversazioni tramite un unico thread.

### Origine

Un'origine rappresenta un canale di comunicazione. Gli esempi includono:

- Facebook (post pubblici, messaggistica)
- Instagram (commenti, menzioni, messaggistica)
- X/Twitter (menzioni)
- WhatsApp
- LinkedIn
- Mail
- Chat incorporata
- ecc

Ogni origine ha uno stato e impostazioni specifiche.

### Coda

Una coda organizza i ticket in base a regole. Può essere:

- Assegnata a gruppi o utenti specifici
- Configurata con contatori per diversi stati dei ticket
- Ordinata per priorità

## Elaborazioni in Background

Il servizio opera in modo asincrono sui dati attraverso 2 modalità:

### Job Sidekiq

- **Chiusura**: Chiude automaticamente i ticket dopo un periodo di tempo specificato appena entrano nello stato *solved*
- **Followup**: Fa transitare i ticket dallo stato di followup allo stato di lavorazione allo scadere del tempo di followup precedentemente impostato dall'operatore

### Consumer Kafka

- **Consumer di Messaggi**: Elabora i messaggi in arrivo da vari canali
- **Consumer di Ticket**: Gestisce gli eventi relativi ai ticket
- **Consumer di Code**: Elabora gli eventi relativi alle code
- **Consumer di Messaggi IA**: Gestisce gli eventi dei messaggi generati dall'IA
- **Consumer di Metadati**: Rileva gli aggiornamenti dei metadati (tag, topic, custom fields) per spostare i ticket nelle code rispettando le condizioni configurate
- **Consumer di Chiusura Escalation**: Gestisce gli eventi di chiusura dell'escalation

## Logiche di Funzionamento

### Quando arriva un messaggio da un canale social...
1. Il messaggio viene processato dal consumer di Messaggi
2. Il messaggio viene organizzato in ticket (*se esiste un ticket ancora aperto appartenente allo stesso utente-canale il messaggio viene accodato, altrimenti viene aperto un nuovo ticket*)
3. Il ticket viene assegnato alle code in base alle regole
4. Gli agenti di supporto lavorano sui ticket attraverso l'API
5. I ticket progrediscono attraverso gli stati (creato → in lavorazione → in attesa → risolto → chiuso)
6. I job in background gestiscono le transizioni automatiche di stato (scadenza del followup, chiusura automatica)
7. Le rule in background gestiscono le azioni (risposte automatiche, ecc)

## Configurazione dell'Ambiente

Il servizio richiede diverse variabili d'ambiente per un corretto funzionamento:

- Configurazione Kafka (KAFKA_HOST, KAFKA_REPLICATION_FACTOR)
- Configurazione MongoDB (MONGODB_HOST, MONGODB_PORT, MONGODB_USERNAME, MONGODB_PASSWORD)
- Configurazione Redis (REDIS_HOST, REDIS_PORT, REDIS_USERNAME, REDIS_PASSWORD)
- Configurazione OpenSearch (OPENSEARCH_HOST, OPENSEARCH_PORT, OPENSEARCH_USERNAME, OPENSEARCH_PASSWORD)
- Impostazioni specifiche del servizio (TICKET_CLOSED_AFTER_MINS, SIDEKIQ_MAX_RETRIES)
- URL dei servizi esterni (USER_SERVICE_URL, TICKET_HELPER_SERVICE_URL)

Per una lista aggiornata e dettagliata delle variabili d'ambiente consultare il README sul repository del progetto.

## Esecuzione del Servizio

### Server API

```bash
./bin/run_puma.sh
```

### Consumatore Kafka

```bash
./bin/run_karafka.sh
```

### Processore di Lavori in Background

```bash
bundle exec sidekiq
```
