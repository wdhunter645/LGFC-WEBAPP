#!/bin/bash

echo "🔍 Monitoring Lou Gehrig Fan Club Site Health"
echo "==========================================="

SITE_URL="https://lgfc-webapp.netlify.app"
CUSTOM_DOMAIN="https://lougehrfanclub.com"

check_url() {
  local url=$1
  local name=$2

  echo -n "Checking $name... "
  status_code=$(curl -s -o /dev/null -w "%{http_code}" "$url" --max-time 10)
  response_time=$(curl -s -o /dev/null -w "%{time_total}" "$url" --max-time 10)

  if [[ "$status_code" == "200" ]]; then
    echo "✅ OK (${response_time}s)"
  else
    echo "❌ FAILED (HTTP $status_code)"
  fi
}

echo "📊 Site Health Check $(date)"
echo ""

check_url "$SITE_URL" "Netlify Site"
check_url "$SITE_URL/admin" "Admin Interface"
check_url "https://vkwhrbjkdznncjkzkiuo.supabase.co/rest/v1/" "Supabase API"
check_url "https://f005.backblazeb2.com/file/LouGehrigFanClub/" "B2 Storage"

if host lougehrfanclub.com >/dev/null 2>&1; then
  echo ""
  echo "🌐 Custom Domain Check:"
  check_url "$CUSTOM_DOMAIN" "Custom Domain"
fi

echo ""
echo "✅ Monitoring completed"
