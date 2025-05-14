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

# Make sure we're in the project root
PROJECT_ROOT="$(pwd)"
NEXT_DIR="${PROJECT_ROOT}/.next"

if [ ! -d "$NEXT_DIR" ]; then
  echo -e "${YELLOW}⚠️ No .next directory found. Nothing to clean.${NC}"
  exit 0
fi

# Light cleanup - Just remove specific problematic caches
if [ "$CLEAN_LEVEL" == "light" ]; then
  echo -e "${BLUE}🔍 Performing light cleanup...${NC}"
  
  # Clean webpack cache
  if [ -d "${NEXT_DIR}/cache/webpack" ]; then
    echo "   Cleaning webpack cache..."
    rm -rf "${NEXT_DIR}/cache/webpack"
  fi
  
  # Clean problematic chunks
  if [ -d "${NEXT_DIR}/static/chunks" ]; then
    echo "   Removing visualization chunks..."
    find "${NEXT_DIR}/static/chunks" -name "*d3*" -delete
    find "${NEXT_DIR}/static/chunks" -name "*visualization*" -delete
  fi
  
  echo -e "${GREEN}✅ Light cleanup complete!${NC}"
  exit 0
fi

# Medium cleanup - Remove cache and development artifacts
if [ "$CLEAN_LEVEL" == "medium" ]; then
  echo -e "${BLUE}🔍 Performing medium cleanup...${NC}"
  
  # Clean development artifacts
  if [ -d "${NEXT_DIR}/cache" ]; then
    echo "   Cleaning .next/cache directory..."
    rm -rf "${NEXT_DIR}/cache"
  fi
  
  if [ -d "${NEXT_DIR}/server/pages" ]; then
    echo "   Cleaning .next/server/pages directory..."
    rm -rf "${NEXT_DIR}/server/pages"
  fi
  
  if [ -d "${NEXT_DIR}/server/chunks" ]; then
    echo "   Cleaning .next/server/chunks directory..."
    rm -rf "${NEXT_DIR}/server/chunks"
  fi
  
  if [ -d "${NEXT_DIR}/static" ]; then
    echo "   Cleaning .next/static directory..."
    rm -rf "${NEXT_DIR}/static"
  fi
  
  echo -e "${GREEN}✅ Medium cleanup complete!${NC}"
  exit 0
fi

# Full cleanup - Remove entire .next directory
if [ "$CLEAN_LEVEL" == "full" ]; then
  echo -e "${BLUE}🔍 Performing full cleanup...${NC}"
  
  echo "   Removing entire .next directory..."
  rm -rf "${NEXT_DIR}"
  
  echo -e "${GREEN}✅ Full cleanup complete!${NC}"
  exit 0
fi

# Deep cleanup - Remove .next, node_modules/.cache and reinstall
if [ "$CLEAN_LEVEL" == "deep" ]; then
  echo -e "${BLUE}🔍 Performing deep cleanup...${NC}"
  
  echo "   Removing .next directory..."
  rm -rf "${NEXT_DIR}"
  
  if [ -d "${PROJECT_ROOT}/node_modules/.cache" ]; then
    echo "   Cleaning node_modules/.cache directory..."
    rm -rf "${PROJECT_ROOT}/node_modules/.cache"
  fi
  
  # Clear React cache
  if [ -d "${PROJECT_ROOT}/node_modules/.cache/react" ]; then
    echo "   Cleaning React cache..."
    rm -rf "${PROJECT_ROOT}/node_modules/.cache/react"
  fi
  
  # Clear Babel cache
  if [ -d "${PROJECT_ROOT}/node_modules/.cache/babel-loader" ]; then
    echo "   Cleaning Babel cache..."
    rm -rf "${PROJECT_ROOT}/node_modules/.cache/babel-loader"
  fi
  
  echo -e "${GREEN}✅ Deep cleanup complete!${NC}"
  exit 0
fi 