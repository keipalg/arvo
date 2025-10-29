#!/bin/bash
GCLOUD_PROJECT="wmdd-pj2-handcraft"
REPO="arvo-backend"
REGION="us-west1"
IMAGE="arvo-backend"

IMAGE_TAG="${REGION}-docker.pkg.dev/${GCLOUD_PROJECT}/${REPO}/${IMAGE}"

echo "Building Docker image..."
docker build -t "$IMAGE_TAG" -f apps/backend/Dockerfile --platform linux/x86_64 .

echo "Pushing image to Artifact Registry..."
docker push "$IMAGE_TAG"

echo "Deploying to Cloud Run..."
gcloud run deploy "$IMAGE" \
  --image "$IMAGE_TAG" \
  --region "$REGION" \
  --platform managed \
  --allow-unauthenticated

echo "Done!"