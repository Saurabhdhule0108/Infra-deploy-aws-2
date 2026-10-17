
#!/usr/bin/env bash
set -euo pipefail

: "${EC2_PUBLIC_IP:?Missing App-1 public IP}"
: "${EC2_PUBLIC_IP_2:?Missing App-2 public IP}"
: "${EC2_PRIVATE_IP_2:?Missing App-2 private IP}"

cat > inventory.ini <<EOF
[primary]
app1 ansible_host=${EC2_PUBLIC_IP}

[backup]
app2 ansible_host=${EC2_PUBLIC_IP_2}

[app_servers:children]
primary
backup

[all:vars]
ansible_user=ubuntu
ansible_python_interpreter=/usr/bin/python3
backup_private_ip=${EC2_PRIVATE_IP_2}
EOF

echo "Ansible inventory generated successfully."
