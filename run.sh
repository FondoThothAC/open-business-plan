#!/bin/bash
# Script to launch OpenBusinessPlan from packaged binaries if available, otherwise fall back to dev mode.

# Get the directory where this script is located
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
APP_DIR="$DIR/dist_electron"

# Detect OS
OS="$(uname -s)"
case "$OS" in
    Linux*)
        # Look for AppImage
        APPImage
        APP_IMAGE=$(find "$APP_DIR" -maxdepth 1 -name '*.AppImage' | head -n 1)
        if [ -n "$APP_IMAGE" ] && [ -x "$APP_IMAGE" ]; then
            echo "Launching $APP_IMAGE"
            exec "$APP_IMAGE"
        else
            echo "AppImage not found or not executable. Falling back to development mode."
            cd "$DIR"
            npm run start
        fi
        ;;
    Darwin*)
        # macOS: look for .app bundle
        APP_BUNDLE="$APP_DIR/mac/OpenBusinessPlan.app"
        if [ -d "$APP_BUNDLE" ]; then
            echo "Opening $APP_BUNDLE"
            open "$APP_BUNDLE"
        else
            echo "App bundle not found. Falling back to development mode."
            cd "$DIR"
            npm run start
        fi
        ;;
    *)
        echo "Unsupported OS: $OS"
        exit 1
        ;;
esac
