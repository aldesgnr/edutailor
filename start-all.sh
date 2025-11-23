#!/bin/bash

echo "🚀 Starting BD-Academy Development Environment..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Kill existing processes
echo -e "${BLUE}Stopping existing processes...${NC}"
lsof -ti:5008 | xargs kill -9 2>/dev/null
lsof -ti:5173 | xargs kill -9 2>/dev/null
sleep 2

# Start Docker backend
echo -e "${BLUE}Starting Docker backend...${NC}"
cd "/Users/ninjawarriot/Documents/Dokumenty — MacBook Pro/ilms (1)/bd-academy-backend"
docker-compose -f docker-compose.local.yml up -d
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Backend started on http://localhost:5007${NC}"
else
    echo -e "${RED}✗ Failed to start backend${NC}"
fi

# Start static server with CORS
echo -e "${BLUE}Starting static server with CORS...${NC}"
cd "/Users/ninjawarriot/Documents/Dokumenty — MacBook Pro/ilms (1)/bd-academy-static"
python3 cors-server.py > /dev/null 2>&1 &
sleep 2
if lsof -ti:5008 > /dev/null; then
    echo -e "${GREEN}✓ Static server started on http://localhost:5008 (CORS enabled)${NC}"
else
    echo -e "${RED}✗ Failed to start static server${NC}"
fi

# Start frontend
echo -e "${BLUE}Starting frontend...${NC}"
cd "/Users/ninjawarriot/Documents/Dokumenty — MacBook Pro/ilms (1)/bd-academy"
npm run dev &
sleep 5
if lsof -ti:5173 > /dev/null; then
    echo -e "${GREEN}✓ Frontend started on http://localhost:5173${NC}"
else
    echo -e "${RED}✗ Failed to start frontend${NC}"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}🎉 All services started!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Frontend:  ${BLUE}http://localhost:5173${NC}"
echo -e "Backend:   ${BLUE}http://localhost:5007${NC}"
echo -e "Static:    ${BLUE}http://localhost:5008${NC}"
echo ""
echo -e "Login: ${BLUE}admin@admin.pl / mju7&UJM${NC}"
echo ""
echo -e "Press Ctrl+C to stop all services"
echo ""

# Wait for user to stop
wait
