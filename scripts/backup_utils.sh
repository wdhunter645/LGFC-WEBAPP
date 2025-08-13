#!/bin/bash

# Supabase Backup Utilities
# Usage: ./scripts/backup_utils.sh [command]

set -e

BACKUP_DIR="backups"
DAILY_DIR="$BACKUP_DIR/daily"
WEEKLY_DIR="$BACKUP_DIR/weekly"
MONTHLY_DIR="$BACKUP_DIR/monthly"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

# Function to check backup status
check_status() {
    print_header "Backup Status Report"
    
    echo ""
    print_status "Daily Backups (14 days retention):"
    if [ -d "$DAILY_DIR" ]; then
        count=$(find "$DAILY_DIR" -name "*.sql" -type f | wc -l)
        echo "  Files: $count"
        if [ $count -gt 0 ]; then
            echo "  Latest: $(ls -t "$DAILY_DIR"/*.sql 2>/dev/null | head -1 | xargs basename 2>/dev/null || echo 'None')"
        fi
    else
        echo "  Directory not found"
    fi
    
    echo ""
    print_status "Weekly Backups (8 weeks retention):"
    if [ -d "$WEEKLY_DIR" ]; then
        count=$(find "$WEEKLY_DIR" -name "*.sql" -type f | wc -l)
        echo "  Files: $count"
        if [ $count -gt 0 ]; then
            echo "  Latest: $(ls -t "$WEEKLY_DIR"/*.sql 2>/dev/null | head -1 | xargs basename 2>/dev/null || echo 'None')"
        fi
    else
        echo "  Directory not found"
    fi
    
    echo ""
    print_status "Monthly Backups (13 months retention):"
    if [ -d "$MONTHLY_DIR" ]; then
        count=$(find "$MONTHLY_DIR" -name "*.sql" -type f | wc -l)
        echo "  Files: $count"
        if [ $count -gt 0 ]; then
            echo "  Latest: $(ls -t "$MONTHLY_DIR"/*.sql 2>/dev/null | head -1 | xargs basename 2>/dev/null || echo 'None')"
        fi
    else
        echo "  Directory not found"
    fi
    
    echo ""
    print_status "Total backup size:"
    total_size=$(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1 || echo "0")
    echo "  $total_size"
}

# Function to manually trigger cleanup
manual_cleanup() {
    print_header "Manual Cleanup"
    
    print_warning "This will delete expired backups according to retention policies:"
    echo "  - Daily backups older than 14 days"
    echo "  - Weekly backups older than 8 weeks"
    echo "  - Monthly backups older than 13 months"
    
    read -p "Continue? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Cleaning up daily backups..."
        find "$DAILY_DIR" -name "*.sql" -type f -mtime +14 -delete 2>/dev/null || true
        
        print_status "Cleaning up weekly backups..."
        find "$WEEKLY_DIR" -name "*.sql" -type f -mtime +56 -delete 2>/dev/null || true
        
        print_status "Cleaning up monthly backups..."
        find "$MONTHLY_DIR" -name "*.sql" -type f -mtime +395 -delete 2>/dev/null || true
        
        print_status "Cleanup completed"
    else
        print_status "Cleanup cancelled"
    fi
}

# Function to show backup file details
list_files() {
    print_header "Backup Files"
    
    echo ""
    print_status "Daily backups:"
    if [ -d "$DAILY_DIR" ]; then
        ls -la "$DAILY_DIR"/*.sql 2>/dev/null || echo "  No files found"
    else
        echo "  Directory not found"
    fi
    
    echo ""
    print_status "Weekly backups:"
    if [ -d "$WEEKLY_DIR" ]; then
        ls -la "$WEEKLY_DIR"/*.sql 2>/dev/null || echo "  No files found"
    else
        echo "  Directory not found"
    fi
    
    echo ""
    print_status "Monthly backups:"
    if [ -d "$MONTHLY_DIR" ]; then
        ls -la "$MONTHLY_DIR"/*.sql 2>/dev/null || echo "  No files found"
    else
        echo "  Directory not found"
    fi
}

# Function to show help
show_help() {
    echo "Supabase Backup Utilities"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  status    - Show backup status and file counts"
    echo "  list      - List all backup files with details"
    echo "  cleanup   - Manually trigger cleanup of expired backups"
    echo "  help      - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 status"
    echo "  $0 list"
    echo "  $0 cleanup"
}

# Main script logic
case "${1:-help}" in
    "status")
        check_status
        ;;
    "list")
        list_files
        ;;
    "cleanup")
        manual_cleanup
        ;;
    "help"|*)
        show_help
        ;;
esac