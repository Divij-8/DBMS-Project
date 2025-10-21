#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🌾 Agricultural Management System - Quick Start${NC}"
echo "=================================================="

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 is not installed${NC}"
    exit 1
fi

# Check if Node is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi

# Check if MySQL is installed
if ! command -v mysql &> /dev/null; then
    echo -e "${YELLOW}⚠️  MySQL is not installed. Please install MySQL Server.${NC}"
fi

echo -e "${GREEN}✅ Prerequisites found${NC}"

# Backend setup
echo -e "\n${YELLOW}📦 Setting up Backend...${NC}"
cd DBMS-PROJECT

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Run migrations
echo "Running database migrations..."
python manage.py migrate

echo -e "${GREEN}✅ Backend setup complete${NC}"

# Frontend setup
echo -e "\n${YELLOW}📦 Setting up Frontend...${NC}"
cd ../shadcn-ui

# Install dependencies
if [ ! -d "node_modules" ]; then
    echo "Installing Node dependencies..."
    npm install
fi

echo -e "${GREEN}✅ Frontend setup complete${NC}"

# Summary
echo -e "\n${GREEN}=================================================="
echo "✨ Setup Complete! Ready to start development"
echo "==================================================${NC}"

echo -e "\n${YELLOW}To start the development servers:${NC}"
echo -e "${GREEN}1. Backend (from DBMS-PROJECT directory):${NC}"
echo "   python manage.py runserver"
echo ""
echo -e "${GREEN}2. Frontend (from shadcn-ui directory):${NC}"
echo "   npm run dev"
echo ""
echo -e "${GREEN}Backend: http://localhost:8000${NC}"
echo -e "${GREEN}Frontend: http://localhost:5173${NC}"
echo -e "${GREEN}Admin: http://localhost:8000/admin${NC}"
