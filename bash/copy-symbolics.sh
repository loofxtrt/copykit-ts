#!/usr/bin/bash

WHITE_SUR=/mnt/seagate/symlinks/copykit-data/data/original-unzipped/WhiteSur-dark
COPYCAT=/mnt/seagate/symlinks/kde-user-icons/copycat

rm -rf "$COPYCAT/actions/16" "$COPYCAT/actions/symbolic"
cp -r "$WHITE_SUR/actions/16" "$COPYCAT/actions/16"
cp -r "$WHITE_SUR/actions/symbolic" "$COPYCAT/actions/symbolic"

rm -rf  "$COPYCAT/apps/symbolic"
cp -r "$WHITE_SUR/apps/symbolic" "$COPYCAT/apps/symbolic"

rm -rf  "$COPYCAT/categories/symbolic"
cp -r "$WHITE_SUR/categories/symbolic" "$COPYCAT/categories/symbolic"

rm -rf  "$COPYCAT/devices/symbolic"
cp -r "$WHITE_SUR/devices/symbolic" "$COPYCAT/devices/symbolic"

rm -rf  "$COPYCAT/emblems/symbolic"
cp -r "$WHITE_SUR/emblems/symbolic" "$COPYCAT/emblems/symbolic"

rm -rf  "$COPYCAT/mimes/symbolic"
cp -r "$WHITE_SUR/mimes/symbolic" "$COPYCAT/mimetypes/symbolic"

# o white sur não tem os ícones de panel, mas o fluent sim
#rm -rf  "$COPYCAT/panel/16"
#rm -rf  "$COPYCAT/panel/22"
#rm -rf  "$COPYCAT/panel/24"

rm -rf  "$COPYCAT/places/symbolic"
cp -r "$WHITE_SUR/places/symbolic" "$COPYCAT/places/symbolic"

rm -rf  "$COPYCAT/status/symbolic"
cp -r "$WHITE_SUR/status/symbolic" "$COPYCAT/status/symbolic"
