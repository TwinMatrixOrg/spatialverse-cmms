#!/bin/bash
set -e

echo "Building SpatialVerse CMMS..."
npm run build

echo "Deploying to demos server..."
mkdir -p /Users/ericc/.openclaw/workspace/demos/tmt-demos-server/cmms
rsync -av dist/ /Users/ericc/.openclaw/workspace/demos/tmt-demos-server/cmms/

echo "Deployment complete!"
