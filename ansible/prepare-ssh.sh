
#!/usr/bin/env bash
set -euo pipefail

: "${EC2_PUBLIC_IP:?Missing App-1 public IP}"
: "${EC2_PUBLIC_IP_2:?Missing App-2 public IP}"
: "${APP1_SSH_HOST_KEY:?Missing App-1 SSH host key}"
: "${APP2_SSH_HOST_KEY:?Missing App-2 SSH host key}"

mkdir -p "$HOME/.ssh"
chmod 700 "$HOME/.ssh"

KNOWN_HOSTS="$HOME/.ssh/known_hosts"
touch "$KNOWN_HOSTS"
chmod 600 "$KNOWN_HOSTS"

verify_and_add_host() {
    local name="$1"
    local ip="$2"
    local public_key="$3"
    local expected_fingerprint="$4"
    local actual_fingerprint

    actual_fingerprint=$(printf '%s\n' "$public_key" |
        ssh-keygen -lf - -E sha256 | awk '{print $2}')

    if [ "$actual_fingerprint" != "$expected_fingerprint" ]; then
        echo "ERROR: SSH host key verification failed for $name"
        exit 1
    fi

    ssh-keygen -R "$ip" -f "$KNOWN_HOSTS" >/dev/null 2>&1 || true

    printf '%s %s\n' "$ip" "$public_key" >> "$KNOWN_HOSTS"

    echo "$name: trusted SSH host key configured."
}

verify_and_add_host \
    "App-1" \
    "$EC2_PUBLIC_IP" \
    "$APP1_SSH_HOST_KEY" \
    "SHA256:YoTmhdBl/yDXcmMKK5t7cXCP5hPxR/wjhi+HtgcJRdo"

verify_and_add_host \
    "App-2" \
    "$EC2_PUBLIC_IP_2" \
    "$APP2_SSH_HOST_KEY" \
    "SHA256:CQnLxTM/CHu4yETJQH4PkyUL9rQVmlVDIGxM3Uj3apo"

echo "SSH host-key preparation completed successfully."
