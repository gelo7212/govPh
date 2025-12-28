#!/bin/bash
# Script to generate self-signed certificates for local development

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
CERT_DIR="$SCRIPT_DIR/ssl"

# Create ssl directory if it doesn't exist
mkdir -p "$CERT_DIR"

echo "Generating self-signed SSL certificate for local development..."

# Check if certificates already exist
if [ -f "$CERT_DIR/cert.pem" ] && [ -f "$CERT_DIR/key.pem" ]; then
    echo "✓ Certificates already exist at $CERT_DIR"
    echo "  cert.pem and key.pem"
    exit 0
fi

# Generate self-signed certificate valid for 1 year
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout "$CERT_DIR/key.pem" \
    -out "$CERT_DIR/cert.pem" \
    -subj "/C=PH/ST=Metro Manila/L=Manila/O=Gov-PH/OU=SOS/CN=localhost"

if [ $? -eq 0 ]; then
    echo "✓ Self-signed certificate generated successfully!"
    echo ""
    echo "Certificate Details:"
    openssl x509 -in "$CERT_DIR/cert.pem" -text -noout | grep -E "Subject:|Issuer:|Not Before|Not After"
    echo ""
    echo "Files created:"
    echo "  - $CERT_DIR/cert.pem"
    echo "  - $CERT_DIR/key.pem"
    echo ""
    echo "⚠️  Browser will show a warning - this is normal for self-signed certificates"
    echo "✓ To bypass the warning in Chrome, click 'Advanced' and 'Proceed to localhost'"
else
    echo "✗ Failed to generate certificate"
    exit 1
fi
