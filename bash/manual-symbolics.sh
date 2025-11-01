#!/usr/bin/bash

WHITE_SUR=/mnt/seagate/symlinks/copykit-data/data/original-unzipped/WhiteSur-dark
COPYCAT=/mnt/seagate/symlinks/kde-user-icons/copycat
SIMPLIFIED=$COPYCAT/all/simplified/

# copia o arquivo pro diretório simplified
cp "$WHITE_SUR/actions@2x/32/user-desktop-symbolic.svg" "$SIMPLIFIED/desktop.svg"

LINK=$COPYCAT/apps/symbolic/preferences-desktop-symbolic.svg
rm -f "$LINK" # remove o arquivo antigo ou symlink
ln -s ../../all/simplified/desktop.svg "$LINK" # cria o symlink relativo

LINK=$COPYCAT/places/symbolic/user-desktop-symbolic.svg
rm -f "$LINK"
ln -s ../../all/simplified/desktop.svg "$LINK"

LINK=$COPYCAT/panel/24/obs-tray.svg
rm -f "$LINK"
ln -s ../../all/simplified/obs-tray.svg "$LINK"

LINK=$COPYCAT/panel/24/obs-tray-active.svg
rm -f "$LINK"
ln -s ../../all/simplified/obs-tray-active.svg "$LINK"