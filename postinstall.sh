#!/bin/bash

# Define the file path
FILE_PATH="node_modules/native-base/src/core/NativeBaseProvider.tsx"

# Check if the file exists
if [ ! -f "$FILE_PATH" ]; then
    echo "Error: File does not exist."
    exit 1
fi

# Remove the import statement for SSRProvider
sed -i '' "/import { SSRProvider } from '@react-native-aria\/utils';/d" "$FILE_PATH"

# Replace '<SSRProvider>{children}</SSRProvider>' with '{children}' (macOS compatible)
sed -i '' -e 's/<SSRProvider>{children}<\/SSRProvider>/{children}/g' "$FILE_PATH"

echo "Modifications complete."