#!/bin/bash
# Fetch spot price from Coinbase API
PAIR=$1
if [ -z "$PAIR" ]; then
  PAIR="SOL-USD"
fi

RESULT=$(curl -s "https://api.coinbase.com/v2/prices/$PAIR/spot")
python3 -c "import json; data=json.loads('$RESULT')['data']; print('{}: \${}'.format(data['base'], data['amount']))"
