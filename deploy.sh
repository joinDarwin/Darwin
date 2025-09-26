#!/bin/bash

# 🚀 Darwin Global Timer - Production Deployment Script
# This script helps deploy the separate services architecture

set -e

echo "🌍 Darwin Global Timer - Production Deployment"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    print_success "Dependencies check passed"
}

# Function to deploy to Railway
deploy_railway() {
    print_status "Deploying to Railway..."
    
    # Check if Railway CLI is installed
    if ! command -v railway &> /dev/null; then
        print_status "Installing Railway CLI..."
        npm install -g @railway/cli
    fi
    
    # Login to Railway
    print_status "Logging into Railway..."
    railway login
    
    # Deploy Timer Service
    print_status "Deploying Timer Service..."
    cd services/timer-service
    railway up --detach
    TIMER_URL=$(railway domain)
    print_success "Timer Service deployed at: $TIMER_URL"
    
    # Deploy Monitor Service
    print_status "Deploying Monitor Service..."
    cd ../solana-monitor-service
    railway up --detach
    MONITOR_URL=$(railway domain)
    print_success "Monitor Service deployed at: $MONITOR_URL"
    
    cd ../..
    
    # Deploy Vercel Frontend
    print_status "Deploying Vercel Frontend..."
    npx vercel --prod
    
    print_success "Deployment completed!"
    print_warning "Don't forget to set environment variables in Vercel dashboard:"
    echo "  TIMER_SERVICE_URL=$TIMER_URL"
    echo "  SOLANA_MONITOR_SERVICE_URL=$MONITOR_URL"
    echo "  NEXT_PUBLIC_HELIUS_API_KEY=your_helius_api_key"
    echo "  HELIUS_API_KEY=your_helius_api_key"
}

# Function to deploy with Docker Compose
deploy_docker() {
    print_status "Deploying with Docker Compose..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Copy environment files
    print_status "Setting up environment files..."
    cp services/timer-service/env.example services/timer-service/.env
    cp services/solana-monitor-service/env.example services/solana-monitor-service/.env
    cp docs/env.example .env
    
    print_warning "Please edit the .env files with your configuration before continuing."
    read -p "Press Enter when you're ready to continue..."
    
    # Start services
    print_status "Starting services with Docker Compose..."
    docker-compose up -d
    
    print_success "Services started!"
    print_status "You can now deploy the Vercel frontend with:"
    echo "  npx vercel"
    print_warning "Make sure to set TIMER_SERVICE_URL=http://localhost:3002 and SOLANA_MONITOR_SERVICE_URL=http://localhost:3001 in Vercel"
}

# Function to show help
show_help() {
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  railway    Deploy to Railway (recommended)"
    echo "  docker     Deploy with Docker Compose (self-hosted)"
    echo "  help       Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 railway    # Deploy to Railway"
    echo "  $0 docker     # Deploy with Docker Compose"
    echo ""
    echo "For detailed instructions, see docs/PRODUCTION_DEPLOYMENT_GUIDE.md"
}

# Main script logic
main() {
    case "${1:-help}" in
        "railway")
            check_dependencies
            deploy_railway
            ;;
        "docker")
            check_dependencies
            deploy_docker
            ;;
        "help"|*)
            show_help
            ;;
    esac
}

# Run main function
main "$@"
