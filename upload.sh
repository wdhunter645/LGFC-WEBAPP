#!/bin/bash

# === CONFIG (Backblaze S3-compatible) ===
AWS_ACCESS_KEY_ID="your_key_id_here"
AWS_SECRET_ACCESS_KEY="your_secret_key_here"
AWS_DEFAULT_REGION="us-west-004"
S3_ENDPOINT="https://s3.us-west-004.backblazeb2.com"
BUCKET_NAME="LouGehrigFanClub"

# === SCRIPT ===
FILE="$1"
if [ -z "$FILE" ]; then
  echo "Usage: ./upload.sh <filename>"
  exit 1
fi

echo "Uploading $FILE to Backblaze S3..."
aws s3 cp "$FILE" "s3://$BUCKET_NAME/$FILE" \
  --endpoint-url "$S3_ENDPOINT" \
  --acl public-read \
  --region "$AWS_DEFAULT_REGION" \
  --content-type "$(file --brief --mime-type "$FILE")"

echo "✅ Upload completed"
