#!/system/bin/sh

set -e

MODDIR=/data/adb/modules/rezygisk

if [ -f "$MODDIR/disable" ]; then
  cat "$MODDIR/module.prop.orig" > "$MODDIR/module.prop"
  rm -f /data/adb/service.d/.rezygisk.sh
fi
