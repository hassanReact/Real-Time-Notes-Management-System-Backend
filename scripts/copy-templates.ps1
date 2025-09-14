$sourcePath = "src/templates"
$destPath = "dist/templates"

# Create the destination directory if it doesn't exist
if (-not (Test-Path $destPath)) {
    New-Item -ItemType Directory -Force -Path $destPath
}

# Copy templates directory recursively
Copy-Item -Path $sourcePath -Destination (Split-Path -Parent $destPath) -Recurse -Force