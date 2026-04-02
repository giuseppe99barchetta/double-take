# Architecture

## High-Level Flow

The core recognition path is:

camera -> snapshot -> detector -> match -> UI

Detailed execution:

1. A camera event is triggered through MQTT or a direct camera endpoint.
2. The API fetches one or more snapshot images.
3. Configured detectors process the image(s).
4. Results are normalized into matches, misses, and unknowns.
5. The API persists match metadata and image files.
6. The frontend consumes API responses and renders match/training/config views.

## Layers

## API Layer

- Location: `api/src/routes` + `api/src/controllers`
- Responsibility:
  - HTTP routing and request validation
  - auth gatekeeping (optional JWT)
  - orchestration of recognition/training/config services

Primary route groups:

- `/api/match`
- `/api/train`
- `/api/config`
- `/api/camera`
- `/api/status`

## Services Layer

- Location: `api/src/util`
- Responsibility:
  - detector integration
  - MQTT connect/publish/subscribe
  - filesystem and storage operations
  - recognition normalization and pipeline control
  - DB utilities

Examples:

- `api/src/util/process.util.js`
- `api/src/util/recognize.util.js`
- `api/src/util/mqtt.util.js`
- `api/src/util/db.util.js`

## Composables Layer

- Location: `frontend/src/features/*/composables`
- Responsibility:
  - stateful UI behavior
  - loading/error lifecycles
  - filter/sort/form management
  - action handlers that call service functions

Examples:

- `frontend/src/features/matches/composables/useMatches.ts`
- `frontend/src/features/config/composables/useConfig.ts`

## UI Layer

- Location: `frontend/src/pages`, `frontend/src/features/*/components`
- Responsibility:
  - route-level pages
  - reusable components
  - interaction with composables only (not direct low-level fetch logic)

## Why This Structure

This structure separates concerns by runtime responsibility:

- Controllers stay focused on API contracts and orchestration.
- Utility services isolate detector/MQTT/storage specifics from routing.
- Frontend composables encapsulate behavior and state for feature pages.
- UI components remain presentation-first and easier to test/refactor.

The result is a codebase where backend integrations and frontend UX can evolve independently with stable contracts in between.
