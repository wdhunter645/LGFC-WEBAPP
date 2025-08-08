#!/bin/bash

# Remove lines 10-11 from .env (keep line 9 which is the comment)
sed -i '10,11d' .env

# Extract lines 1-4 from .env.example and append to .env starting at line 10
head -n 4 .env.example | tail -n +1 | sed '1i\\' >> temp_lines
sed -i '9r temp_lines' .env
rm temp_lines

# Add the traffic simulator variables
echo "" >> .env
echo "# For traffic simulator" >> .env
echo "SUPABASE_URL=https://xlvgimdnmgywkyvhjvne.supabase.co" >> .env
echo "SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhsdmdpbWRubWd5d2t5dmhqdm5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjAwMDAwMDAwMDIsImV4cCI6MjAzNTgyNDA4OX0.L1zaSyCeqylWTj4S140v2_78oxtGnHveV-GMZdc" >> .env

echo "✅ .env file updated successfully"
cat .env
