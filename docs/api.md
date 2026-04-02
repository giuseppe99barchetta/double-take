# API Documentation

Base URL:

- `http://localhost:3000/api`

Auth:

- Most endpoints below are protected by JWT middleware when `auth: true`.
- Send `authorization: <token>` header where required.

## Matches

## Fetch matches

- Method: `POST`
- Path: `/api/match?page=1`
- Description: Returns paginated match records with optional filtering payload.

Example request:

```http
POST /api/match?page=1
Content-Type: application/json
Authorization: <token>

{
  "sinceId": 0,
  "filters": {}
}
```

Example response:

```json
{
  "total": 124,
  "limit": 50,
  "matches": [
    {
      "id": 9001,
      "camera": "driveway",
      "type": "camera-event",
      "zones": [],
      "file": {
        "key": "matches/2f07d1ad.jpg",
        "filename": "2f07d1ad.jpg",
        "width": 1280,
        "height": 720
      },
      "isTrained": false,
      "response": [
        {
          "detector": "compreface",
          "results": [
            {
              "name": "alice",
              "match": true,
              "confidence": 94.2
            }
          ]
        }
      ],
      "createdAt": "2026-04-02T10:00:00.000Z",
      "updatedAt": null,
      "token": "<image-token>"
    }
  ]
}
```

## Delete matches

- Method: `DELETE`
- Path: `/api/match`
- Description: Deletes match rows by ID and removes corresponding media files.

Example request:

```http
DELETE /api/match
Content-Type: application/json
Authorization: <token>

{
  "ids": [9001, 9002]
}
```

Example response:

```json
{
  "success": true
}
```

## Add match(es) to training

- Method: `POST`
- Path: `/api/train/add/{name}`
- Description: Queues training for a subject using uploaded files, URLs, or match IDs.

Example request (from match IDs):

```http
POST /api/train/add/alice
Content-Type: application/json
Authorization: <token>

{
  "ids": [9001]
}
```

Example response:

```json
{
  "message": "training queued for alice"
}
```

## Config

## Get config (JSON)

- Method: `GET`
- Path: `/api/config`
- Description: Returns merged runtime config object.

Example request:

```http
GET /api/config
Authorization: <token>
```

Example response:

```json
{
  "auth": false,
  "detect": {
    "match": { "confidence": 60, "min_area": 10000, "purge": 168, "save": true },
    "unknown": { "confidence": 40, "min_area": 0, "purge": 8, "save": true }
  },
  "mqtt": {
    "host": "127.0.0.1",
    "topics": {
      "matches": "double-take/matches",
      "cameras": "double-take/cameras"
    }
  }
}
```

## Get config (YAML)

- Method: `GET`
- Path: `/api/config?format=yaml`
- Description: Returns raw YAML string from `config.yml`.

Example request:

```http
GET /api/config?format=yaml
Authorization: <token>
```

Example response:

```yaml
auth: false
mqtt:
  host: 127.0.0.1
```

## Update config YAML

- Method: `PATCH`
- Path: `/api/config`
- Description: Validates YAML and writes it to `config.yml`.

Example request:

```http
PATCH /api/config
Content-Type: application/json
Authorization: <token>

{
  "code": "auth: false\nmqtt:\n  host: 127.0.0.1\n"
}
```

Example response:

```json
{}
```

## Cameras

## Trigger camera snapshot recognition

- Method: `GET`
- Path: `/api/camera/{name}`
- Description: Resolves camera snapshot config and forwards processing through recognition pipeline.

Example request:

```http
GET /api/camera/driveway?attempts=1&break=true
Authorization: <token>
```

Example response:

```json
{
  "id": "6aa8f4b1-5c4f-4a8f-b840-1458be2f645f",
  "duration": 1.14,
  "timestamp": "2026-04-02T10:12:00.000Z",
  "attempts": 1,
  "camera": "driveway",
  "zones": [],
  "counts": { "person": 1, "match": 1, "miss": 0, "unknown": 0 },
  "matches": [
    {
      "name": "alice",
      "confidence": 94.2,
      "match": true,
      "detector": "compreface",
      "filename": "2f07d1ad.jpg"
    }
  ],
  "misses": [],
  "unknowns": []
}
```

## System

## MQTT status

- Method: `GET`
- Path: `/api/status/mqtt`
- Description: Reports MQTT client connection state.

Example request:

```http
GET /api/status/mqtt
Authorization: <token>
```

Example response:

```json
{
  "connected": true,
  "status": "connected"
}
```

## OpenAPI

Machine-readable contract:

- `api/openapi.json`
