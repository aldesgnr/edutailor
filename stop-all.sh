#!/bin/bash

echo "🛑 Stopping BD-Academy Development Environment..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Stop frontend
echo -e "${RED}Stopping frontend...${NC}"
lsof -ti:5173 | xargs kill -9 2>/dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Frontend stopped${NC}"
fi

# Stop static server
echo -e "${RED}Stopping static server...${NC}"
lsof -ti:5008 | xargs kill -9 2>/dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Static server stopped${NC}"
fi

# Stop Docker backend
echo -e "${RED}Stopping Docker backend...${NC}"
cd "/Users/ninjawarriot/Documents/Dokumenty — MacBook Pro/ilms (1)/bd-academy-backend"
docker-compose -f docker-compose.local.yml down
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Backend stopped${NC}"
fi

echo ""
echo -e "${GREEN}✓ All services stopped!${NC}"
