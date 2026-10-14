#!/usr/bin/env bash
# Scan the local network for a Gaggiuino (ESP32) controller.
#
# Strategy:
#   1. Resolve gaggiuino.local via mDNS (fast path when the machine is online).
#   2. nmap the local subnet(s) for hosts with HTTP/HTTPS open and report:
#      - hosts whose HTTP title or headers mention "gaggiuino"
#      - hosts whose MAC belongs to Espressif (ESP32 boards)
#      - the host that answers to gaggiuino.local via mDNS
#
# Usage:
#   scripts/find-gaggiuino.sh                   # auto-detect local subnet(s)
#   scripts/find-gaggiuino.sh 192.168.1.0/24    # scan a specific range
#   sudo scripts/find-gaggiuino.sh              # also gets MAC vendors via ARP
set -uo pipefail

MDNS_NAME="gaggiuino.local"
PORTS="80,443"

if ! command -v nmap >/dev/null 2>&1; then
  echo "nmap not found. Install it first:" >&2
  echo "  Debian/Ubuntu: sudo apt install nmap" >&2
  echo "  macOS:         brew install nmap" >&2
  exit 1
fi

if [ "$(id -u)" -ne 0 ]; then
  echo "Note: running without root. Re-run with sudo to get ARP and MAC vendor info." >&2
fi

# 1. mDNS lookup -------------------------------------------------------------
resolve_mdns() {
  local ip=""
  if command -v avahi-resolve-host-name >/dev/null 2>&1; then
    ip=$(avahi-resolve-host-name -4 "$MDNS_NAME" 2>/dev/null | awk '{print $2}')
  fi
  if [ -z "$ip" ] && command -v dscacheutil >/dev/null 2>&1; then   # macOS
    ip=$(dscacheutil -q host -a name "$MDNS_NAME" 2>/dev/null | awk '/ip_address/{print $2; exit}')
  fi
  if [ -z "$ip" ] && command -v getent >/dev/null 2>&1; then
    ip=$(getent ahostsv4 "$MDNS_NAME" 2>/dev/null | awk 'NR==1{print $1}')
  fi
  printf '%s' "$ip"
}

MDNS_IP=$(resolve_mdns)
if [ -n "$MDNS_IP" ]; then
  echo "mDNS: $MDNS_NAME -> $MDNS_IP"
else
  echo "mDNS: $MDNS_NAME did not resolve (device offline, or mDNS blocked). Scanning the network..."
fi
echo

# 2. Pick targets ------------------------------------------------------------
TARGETS=()
if [ "$#" -gt 0 ]; then
  TARGETS=("$@")
else
  # nmap --iflist prints: DEV (SHORT) IP/MASK TYPE UP MTU MAC
  while read -r addr; do
    TARGETS+=("$addr")
  done < <(nmap --iflist 2>/dev/null | awk '
    $5 == "up" && $4 != "loopback" && $3 ~ /\// {
      split($3, a, "/")
      if (a[2] + 0 >= 22) print $3
      else print "skipping " $3 " (too large, pass it explicitly)" > "/dev/stderr"
    }')
fi

if [ "${#TARGETS[@]}" -eq 0 ]; then
  echo "No local subnet found. Pass one explicitly, e.g. scripts/find-gaggiuino.sh 192.168.1.0/24" >&2
  exit 1
fi

# 3. Scan --------------------------------------------------------------------
OUT=$(mktemp -d)
TABLE="$OUT/table.txt"
: > "$TABLE"

for target in "${TARGETS[@]}"; do
  echo "Scanning $target (ports $PORTS)..."
  nmap -n -p "$PORTS" --open -sV -T4 --max-retries 2 \
    --script http-title,http-server-header \
    -oN "$OUT/scan.txt" "$target" >/dev/null 2>&1

  # Each nmap host block is a paragraph (RS=""). Summarise hosts with web ports open.
  awk -v RS="" -v mdns="$MDNS_IP" '
    /(80|443)\/tcp[ \t]+open/ {
      ip = ""
      if (match($0, /[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+/)) ip = substr($0, RSTART, RLENGTH)
      title = "-"; mac = "-"
      n = split($0, lines, "\n")
      for (i = 1; i <= n; i++) {
        if (lines[i] ~ /http-title:/) { sub(/.*http-title: */, "", lines[i]); title = lines[i] }
        if (lines[i] ~ /MAC Address:/) { sub(/.*MAC Address: */, "", lines[i]); mac = lines[i] }
      }
      tags = ""
      if (tolower($0) ~ /gaggiuino/)      tags = tags "GAGGIUINO "
      if (mac ~ /Espressif/)              tags = tags "ESP32 "
      if (mdns != "" && ip == mdns)       tags = tags "MDNS "
      if (tags == "") tags = "http"
      printf "%-16s %-22s %-32s %s\n", ip, tags, substr(title, 1, 32), mac
    }' "$OUT/scan.txt" >> "$TABLE"
done

# 4. Report ------------------------------------------------------------------
echo
printf "%-16s %-22s %-32s %s\n" "IP" "MATCH" "HTTP TITLE" "MAC"
printf "%-16s %-22s %-32s %s\n" "----------------" "----------------------" "--------------------------------" "---"
if [ -s "$TABLE" ]; then
  sort -u "$TABLE"
else
  echo "(no hosts with ports $PORTS open)"
fi
echo

HITS=$(grep -E 'GAGGIUINO|MDNS' "$TABLE" | awk '{print $1}' | sort -u)
if [ -n "$HITS" ]; then
  echo "Gaggiuino found at:"
  while read -r ip; do
    echo "  http://$ip/"
  done <<< "$HITS"
else
  echo "No Gaggiuino detected by name, title or mDNS."
  echo "If it is powered on, check the ESP32 rows above (MAC 'Espressif') and try http://<ip>/ in a browser."
  echo "Tip: sudo gives MAC vendors. Passing your subnet explicitly also helps: scripts/find-gaggiuino.sh 192.168.1.0/24"
fi

echo
echo "Full nmap output: $OUT/scan.txt"
