#!/usr/bin/env bash
set -e

# PAI-Kiro CLI One-Line Installer

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}   PAI-Kiro CLI Installation Wrapper     ${NC}"
echo -e "${GREEN}=========================================${NC}"

# Check for bun
if ! command -v bun &> /dev/null; then
    echo -e "${RED}Error: Bun runtime is required but not installed.${NC}"
    echo -e "Please install Bun first: curl -fsSL https://bun.sh/install | bash"
    exit 1
fi

echo -e "${GREEN}✓ Bun runtime detected${NC}"

# Get directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
cd "$SCRIPT_DIR"

# Build/Install dependencies for pai-core
echo -e "\n${YELLOW}Installing dependencies for pai-core...${NC}"
cd pai-core
bun install
cd "$SCRIPT_DIR"

# Build/Install dependencies for kiro-adapter
echo -e "\n${YELLOW}Installing dependencies for kiro-adapter...${NC}"
cd kiro-adapter
bun install
cd "$SCRIPT_DIR"

# Run installer script
echo -e "\n${YELLOW}Running the PAI-Kiro CLI installation wizard...${NC}"
cd kiro-adapter
bun run install:kiro-cli "$@"
