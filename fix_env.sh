#!/bin/bash

# Remove lines 10-11 from .env (keep line 9 which is the comment)
sed -i '10,11d' .env

# Extract lines 1-4 from .env.example and append to .env starting at line 10
head -n 4 .env.example | tail -n +1 | sed '1i\\' >> temp_lines
sed -i '9r temp_lines' .env
rm temp_lines

# Traffic simulator variables removed as simulator infrastructure has been decommissioned

echo "✅ .env file updated successfully"
cat .env
