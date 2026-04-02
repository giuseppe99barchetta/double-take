# Configuration

Double Take reads runtime configuration from:

- `./.storage/config/config.yml`

The file is merged with backend defaults at startup (`api/src/constants/defaults.js`). You only need to define keys you want to override.

## YAML Structure (real runtime keys)

```yaml
auth: false

token:
  image: 24h

time:
  timezone: UTC

server:
  port: 3000

storage:
  path: ./.storage
  config:
    path: ./.storage/config
  secrets:
    path: ./.storage/config
    extension: yml
  media:
    path: ./.storage
  tmp:
    path: /tmp/double-take

mqtt:
  protocol: mqtt
  host: 127.0.0.1
  port: 1883
  username: user
  password: pass
  client_id: double-take
  tls:
    key: /path/client.key
    cert: /path/client.crt
    ca: /path/ca.crt
    reject_unauthorized: true
  topics:
    frigate: frigate/events
    matches: double-take/matches
    cameras: double-take/cameras
    homeassistant: homeassistant

frigate:
  url: http://localhost:5000
  labels:
    - person
  stop_on_match: true
  min_area: 0
  device_tracker_timeout: 30
  cameras: []
  attempts:
    latest: 10
    snapshot: 10
    mqtt: true
    delay: 0
  image:
    height: 500
  events: {}

detect:
  match:
    save: true
    base64: false
    confidence: 60
    purge: 168
    min_area: 10000
  unknown:
    save: true
    base64: false
    confidence: 40
    purge: 8
    min_area: 0

detectors:
  compreface:
    url: http://localhost:8000
    key: your-api-key
    timeout: 15
    det_prob_threshold: 0.8
    opencv_face_required: false
  deepstack:
    url: http://localhost:5001
    key: your-api-key
    timeout: 15
    opencv_face_required: false
  aiserver:
    url: http://localhost:32168
    key: your-api-key
    timeout: 15
    opencv_face_required: false
  facebox:
    url: http://localhost:8080
    timeout: 15
    opencv_face_required: false
  rekognition:
    aws_region: us-east-1
    aws_access_key_id: your-access-key
    aws_secret_access_key: your-secret-key
    collection_id: double-take
    opencv_face_required: true

opencv:
  scale_factor: 1.05
  min_neighbors: 4.5
  min_size_width: 30
  min_size_height: 30

cameras:
  driveway:
    snapshot:
      url: http://camera/snapshot.jpg
      topic: driveway/snapshot
      crop: true
    detect:
      match:
        confidence: 70
      unknown:
        confidence: 45
    masks:
      coordinates:
        - 0,0,100,0,100,100,0,100

notify:
  only_unknown: false
  types:
    - snapshot
    - latest
    - mqtt
    - frigate
    - manual
  gotify:
    url: http://localhost:8080
    token: your-token
    priority: 10
  telegram:
    token: your-token
    chat_id: "12345678"
    priority: 5

logs:
  level: info
  sql: false

ui:
  path: ""
  theme: bootstrap4-dark-blue
  editor:
    theme: nord_dark
  logs:
    lines: 500
  pagination:
    limit: 50
  thumbnails:
    quality: 95
    width: 500
```

## Focus Areas

## MQTT

Key fields:

- `mqtt.host`, `mqtt.port`, `mqtt.protocol`
- `mqtt.username`, `mqtt.password`, `mqtt.client_id`
- `mqtt.topics` (`frigate`, `matches`, `cameras`, `homeassistant`)

## Detectors

Configured under `detectors.<name>`.

Common keys:

- `url`
- `timeout`
- `opencv_face_required`

Detector-specific examples:

- `detectors.compreface.key`
- `detectors.compreface.det_prob_threshold`
- `detectors.rekognition.collection_id`

## Cameras

Each camera is keyed by name under `cameras`.

Common keys:

- `snapshot.url`
- `snapshot.topic`
- `snapshot.crop`
- optional camera-level detect overrides in `detect`
- optional mask polygons in `masks.coordinates`

## Detect Thresholds

Global threshold groups:

- `detect.match`
- `detect.unknown`

Important fields:

- `confidence`
- `min_area`
- `purge`
- `save`

## Storage

Storage is resolved at runtime from environment-aware paths in backend constants:

- `storage.path`
- `storage.config.path`
- `storage.secrets.path`
- `storage.media.path`
- `storage.tmp.path`

Default local setup stores persistent project data under `.storage`.
