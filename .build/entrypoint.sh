#!/bin/sh
set -e

cd /double-take
if [ "$HA_ADDON" = "true" ] && [ -f "/data/options.json" ]
then
  for s in $(echo $values | jq -r "to_entries|map(\"\(.key)=\(.value|tostring)\")|.[]" /data/options.json ); do
    export $s;
  done
fi

ldconfig -p | grep cuffda >/dev/null && CUDA=true || CUDA=false

node -e 'require("./api/src/constants")()'
exec node api/server.js