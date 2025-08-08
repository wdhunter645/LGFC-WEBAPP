#!/bin/bash

# Determine backup type
mode="daily"
day=$(date +%a)
week=$(date +%V)

if [ "$1" = "weekly" ]; then
  mode="weekly"
  filename="weekly-W${week}.sql"
  folder="backups/weekly"
else
  filename="daily-${day}.sql"
  folder="backups/daily"
fi

# Dump schema
supabase db dump --schema public > "$folder/$filename"

# Commit and push to GitHub
git add "$folder/$filename"
git commit -m "Backup: Supabase schema ($mode) for $(date +%F)"
git push
