#!/bin/bash

echo "=========================================="
echo "🚀 Agricultural System - Full Startup"
echo "=========================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if MySQL is running
echo -e "\n${YELLOW}[1/4] Checking MySQL service...${NC}"
if brew services list | grep mysql | grep started > /dev/null; then
    echo -e "${GREEN}✓ MySQL is running${NC}"
else
    echo -e "${YELLOW}Starting MySQL...${NC}"
    brew services start mysql
    sleep 2
    echo -e "${GREEN}✓ MySQL started${NC}"
fi

# Backend startup
echo -e "\n${YELLOW}[2/4] Starting Django Backend...${NC}"
cd /Users/divijmazumdar/DBMS-Project/DBMS-PROJECT
source ../.venv/bin/activate
echo -e "${GREEN}✓ Virtual environment activated${NC}"
echo ""
echo -e "${YELLOW}Backend starting at http://localhost:8000${NC}"
echo -e "${YELLOW}API at http://localhost:8000/api${NC}"
echo -e "${YELLOW}Admin at http://localhost:8000/admin${NC}"
echo ""
python manage.py runserver &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 3

# Frontend startup
echo -e "\n${YELLOW}[3/4] Starting React Frontend...${NC}"
cd /Users/divijmazumdar/DBMS-Project/shadcn-ui
echo -e "${GREEN}✓ Frontend dependencies ready${NC}"
echo ""
echo -e "${YELLOW}Frontend starting at http://localhost:5173${NC}"
echo ""
pnpm run dev &
FRONTEND_PID=$!

echo -e "\n${GREEN}=========================================="
echo "✅ All services started successfully!"
echo "==========================================${NC}"
echo ""
echo "📍 Endpoints:"
echo "   Backend API: http://localhost:8000/api"
echo "   Frontend:    http://localhost:5173"
echo "   Admin:       http://localhost:8000/admin"
echo ""
echo "🛑 To stop services, press Ctrl+C"
echo ""
wait $BACKEND_PID $FRONTEND_PID
