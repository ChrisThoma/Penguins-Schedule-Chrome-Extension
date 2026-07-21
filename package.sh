#!/bin/sh
# Package the extension for the Chrome Web Store and addons.mozilla.org.
# The two zips are identical; separate names leave room to diverge later.
set -e
cd "$(dirname "$0")"

VERSION=$(python3 -c "import json; print(json.load(open('manifest.json'))['version'])")
FILES="manifest.json popup.html popup.js background.js schedule.json icon.png icon-48.png icon-16.png"

for BROWSER in chrome firefox; do
    ZIP="store-assets/penguins-schedule-$VERSION-$BROWSER.zip"
    rm -f "$ZIP"
    zip -j "$ZIP" $FILES
    echo "Wrote $ZIP"
done
