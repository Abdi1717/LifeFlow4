#!/bin/bash

# Advanced Next.js cache cleaning script with selective options
# Usage: ./clean-next-cache.sh [option]
#   Options:
#     --light   Light cleanup (keeps most .next structure)
#     --medium  Medium cleanup (default)
#     --full    Full cleanup (completely removes .next)
#     --deep    Deep cleanup (removes .next, node_modules/.cache, and performs npm installation)

# Set colors for pretty output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parse arguments
CLEAN_LEVEL="medium"
if [ "$1" == "--light" ]; then
  CLEAN_LEVEL="light"
elif [ "$1" == "--full" ]; then
  CLEAN_LEVEL="full"  
elif [ "$1" == "--deep" ]; then
  CLEAN_LEVEL="deep"
fi

echo -e "${BLUE}🧹 Next.js Cache Cleaner - ${CLEAN_LEVEL} mode${NC}"

# Stop any running Next.js processes
echo -e "${YELLOW}Stopping any running Next.js processes...${NC}"
pkill -f "node.*next" > /dev/null 2>&1 || true

# Function to clean webpack cache selectively
clean_webpack_cache() {
  if [ -d ".next/cache/webpack" ]; then
    echo -e "${YELLOW}Cleaning webpack cache...${NC}"
    
    # Keep the structure but remove the content
    find .next/cache/webpack -name "*.pack.gz*" -type f -delete
    find .next/cache/webpack -name "*.pack" -type f -delete
    
    # Create fresh webpack cache directories if they don't exist
    mkdir -p .next/cache/webpack/client-development
    mkdir -p .next/cache/webpack/server-development
    
    echo -e "${GREEN}✓ Webpack cache cleaned${NC}"
  fi
}

# Depending on the clean level, perform different operations
case $CLEAN_LEVEL in
  "light")
    echo -e "${YELLOW}Performing light cleanup...${NC}"
    clean_webpack_cache
    
    # Remove specific problematic cache files but keep structure
    rm -f .next/server/middleware*.js
    rm -f .next/server/pages-manifest.json
    rm -f .next/server/middleware-build-manifest.js
    rm -f .next/trace
    ;;
    
  "medium")
    echo -e "${YELLOW}Performing medium cleanup...${NC}"
    
    # Remove cache but preserve the .next directory structure
    rm -rf .next/cache
    rm -rf .next/server
    rm -rf .next/static
    mkdir -p .next/cache/webpack/client-development
    mkdir -p .next/cache/webpack/server-development
    echo -e "${GREEN}✓ Server and static assets cleaned${NC}"
    
    # Clean node_modules cache
    echo -e "${YELLOW}Cleaning node_modules/.cache...${NC}"
    rm -rf node_modules/.cache
    echo -e "${GREEN}✓ node_modules cache cleaned${NC}"
    ;;
    
  "full")
    echo -e "${YELLOW}Performing full cleanup...${NC}"
    
    # Remove entire .next directory
    rm -rf .next
    mkdir -p .next
    
    # Clean node_modules cache
    echo -e "${YELLOW}Cleaning node_modules/.cache...${NC}"
    rm -rf node_modules/.cache
    ;;
    
  "deep")
    echo -e "${YELLOW}Performing deep cleanup...${NC}"
    
    # Remove entire .next directory
    rm -rf .next
    
    # Remove cache directories
    echo -e "${YELLOW}Cleaning node_modules/.cache...${NC}"
    rm -rf node_modules/.cache
    
    # Clean the temp directory (helps with disk space issues)
    echo -e "${YELLOW}Cleaning temporary files...${NC}"
    rm -rf /tmp/next-*
    
    # Run Next.js's own cleanup
    echo -e "${YELLOW}Running Next.js cleanup...${NC}"
    npx next telemetry disable > /dev/null 2>&1
    npx next cleanup > /dev/null 2>&1
    
    # Clean npm cache (optional)
    echo -e "${YELLOW}Verifying npm cache...${NC}"
    npm cache verify > /dev/null 2>&1
    
    echo -e "${YELLOW}Installing packages with forced clean state...${NC}"
    npm install --force
    ;;
esac

# Tell the user we're done
echo -e "${GREEN}✅ Cache cleaning complete! (${CLEAN_LEVEL} mode)${NC}"
echo ""
echo -e "You can now restart your development server:"
echo -e "${BLUE}npm run dev:fast${NC}"
echo ""
echo -e "${YELLOW}Additional Options:${NC}"
echo -e "  --light   Light cleanup (keeps most .next structure)"
echo -e "  --medium  Medium cleanup (default)"
echo -e "  --full    Full cleanup (completely removes .next)"
echo -e "  --deep    Deep cleanup (removes everything and reinstalls packages)" 