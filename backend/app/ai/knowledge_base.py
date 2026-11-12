"""
NEXUS AI Enterprise Troubleshooting Knowledge Base.
Contains curated Standard Operating Procedures (SOPs) and remediation runbooks across IT domains.
"""

KNOWLEDGE_DOCUMENTS_CORPUS = [
    {
        "doc_id": "KB-NET-01",
        "title": "VPN Disconnection and Tunnel Gateway Timeout Remediation",
        "category": "Network",
        "tags": "vpn, anyconnect, timeout, routing, gateway, 10060, tunnel",
        "content": (
            "Symptoms: Cisco AnyConnect or GlobalProtect VPN drops every 10-15 minutes or fails with timeout 10060.\n"
            "Probable Cause: Gateway session timeout policy mismatch, MTU fragmentation on Wi-Fi connection, "
            "or local network NAT keepalive expiry.\n"
            "Remediation Steps:\n"
            "1. Verify that the user's local internet connection has stable ping (<50ms jitter) to 8.8.8.8.\n"
            "2. Lower client MTU from 1500 to 1350 in VPN adapter settings to avoid packet fragmentation.\n"
            "3. Switch protocol from IPsec UDP 4500 to TLS TCP 443 in AnyConnect preferences.\n"
            "4. Verify client split-tunnel route table by running 'route print' in Windows PowerShell.\n"
            "5. If issue persists, check Palo Alto VPN gateway logs for session renegotiation errors."
        ),
        "source": "Network Infrastructure Runbook v3.2",
    },
    {
        "doc_id": "KB-NET-02",
        "title": "Enterprise 802.1x RADIUS Wi-Fi Authentication Failures",
        "category": "Network",
        "tags": "wifi, radius, 802.1x, certificate, wpa2, enterprise, nps",
        "content": (
            "Symptoms: Workstations cannot connect to corporate Wi-Fi SSID; prompts for credentials continuously.\n"
            "Probable Cause: Expired FreeRADIUS or Microsoft NPS server TLS certificate, or client CA trust store missing intermediate cert.\n"
            "Remediation Steps:\n"
            "1. Check Windows Event Viewer under 'NetworkPolicyServer' on domain controller for Error 16.\n"
            "2. Verify RADIUS server certificate validity date. If expired, re-issue via internal Active Directory Certificate Services (AD CS).\n"
            "3. Check client certificate enrollment status via 'certmgr.msc'. Ensure machine certificate is in Personal store.\n"
            "4. Push updated Wireless Profile XML via Intune MDM or Group Policy.\n"
            "5. Restart RADIUS service ('net stop ias && net start ias')."
        ),
        "source": "Wireless Network Operations Guide",
    },
    {
        "doc_id": "KB-DB-01",
        "title": "PostgreSQL Connection Pool Exhaustion and Idle Transaction Cleanup",
        "category": "Database",
        "tags": "postgresql, database, connection pool, pgbouncer, 5432, max_connections, idle",
        "content": (
            "Symptoms: Applications report 'FATAL: remaining connection slots are reserved for non-replication superusers'.\n"
            "Probable Cause: Application workers leaking connections by opening transactions without explicit commit or rollback.\n"
            "Remediation Steps:\n"
            "1. Query pg_stat_activity to identify idle in transaction sessions: "
            "'SELECT pid, usename, state, query_start, query FROM pg_stat_activity WHERE state = 'idle in transaction';'\n"
            "2. Terminate rogue blocking backends: 'SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'idle in transaction' AND query_start < NOW() - INTERVAL '10 minutes';'\n"
            "3. Verify PgBouncer connection pooler metrics and restart if connection leaks saturated pool.\n"
            "4. Configure 'idle_in_transaction_session_timeout = '60000'' (60s) in postgresql.conf to auto-terminate future leaks.\n"
            "5. Notify development team to verify session closing in SQLAlchemy or ORM connection pool."
        ),
        "source": "Database Administration Handbook",
    },
    {
        "doc_id": "KB-DB-02",
        "title": "Relational Database Deadlocks and Transaction Contention Resolution",
        "category": "Database",
        "tags": "database, deadlock, postgresql, mysql, transaction, lock wait, innodb",
        "content": (
            "Symptoms: Batch jobs or web checkout fail with 'deadlock detected' or 'Lock wait timeout exceeded'.\n"
            "Probable Cause: Concurrent threads acquiring row locks in differing sequence across shared tables.\n"
            "Remediation Steps:\n"
            "1. Inspect lock graph in PostgreSQL: 'SELECT * FROM pg_locks pl JOIN pg_stat_activity psa ON pl.pid = psa.pid;'\n"
            "2. In MySQL, inspect: 'SHOW ENGINE INNODB STATUS;'\n"
            "3. Identify the conflicting SQL queries and update order.\n"
            "4. Enforce strict alphabetical or primary key ordering when locking multiple rows in transaction code.\n"
            "5. Implement exponential backoff retry in application database layer for transient deadlock errors."
        ),
        "source": "Database High-Availability Runbook",
    },
    {
        "doc_id": "KB-HW-01",
        "title": "USB-C Thunderbolt Docking Station External Monitor Flicker",
        "category": "Hardware",
        "tags": "monitor, dock, usb-c, thunderbolt, display, flicker, dell, hdmi, displayport",
        "content": (
            "Symptoms: External DisplayPort or HDMI monitor randomly goes black for 3 seconds then recovers.\n"
            "Probable Cause: Thunderbolt dock firmware out of date, DisplayPort 1.4 DSC handshake failure, or USB-C power delivery negotiation drop.\n"
            "Remediation Steps:\n"
            "1. Disconnect dock power brick from wall for 30 seconds to perform power discharge.\n"
            "2. Update Dell/Lenovo Dock Firmware using manufacturer update utility (e.g. Dell Command Update).\n"
            "3. Update Intel / AMD integrated graphics drivers to latest enterprise certified driver.\n"
            "4. Disable 'DisplayPort 1.4 High Bit Rate 3' on the physical monitor on-screen display (OSD) and switch to DP 1.2 if 4K@60Hz is flickering.\n"
            "5. Replace passive DisplayPort cable with certified VESA active DisplayPort 1.4 cable."
        ),
        "source": "End-User Computing Hardware Guide",
    },
    {
        "doc_id": "KB-HW-02",
        "title": "Laptop Thermal Throttling, Fan Noise, and Overheating Remediation",
        "category": "Hardware",
        "tags": "hardware, laptop, fan, thermal throttling, overheating, cpu, noise, heatsink",
        "content": (
            "Symptoms: Laptop fan screams at maximum RPM continuously; CPU clock speed throttles down to 0.79 GHz causing severe compiling or video lag.\n"
            "Probable Cause: Clogged heatsink exhaust vents, dried thermal compound, or Windows WMI Provider Host CPU runaway.\n"
            "Remediation Steps:\n"
            "1. Check Windows Task Manager to ensure no background software is pegged at 100% CPU.\n"
            "2. Use compressed air canister to blow out exhaust vents and intake grills while laptop is powered off.\n"
            "3. Run manufacturer hardware diagnostics (F12 on boot for Dell ePSA, Enter on boot for Lenovo ThinkPad).\n"
            "4. In Windows Power Plan, verify 'System cooling policy' is set to Active.\n"
            "5. If fan bearing makes rattling noise, order manufacturer replacement fan assembly."
        ),
        "source": "Workstation Maintenance Runbook",
    },
    {
        "doc_id": "KB-HW-03",
        "title": "Swollen Lithium-Ion Battery Safety and Replacement Protocol",
        "category": "Hardware",
        "tags": "battery, swollen, hardware, safety, fire, macbook, dell, bulge",
        "content": (
            "Symptoms: Trackpad lifting out of chassis, keyboard warping upward, or laptop rocking unevenly on flat surface.\n"
            "Probable Cause: Lithium-ion pouch battery gas accumulation due to cell degradation or overcharging.\n"
            "SAFETY WARNING: Do NOT press, puncture, or attempt to force the battery back into position.\n"
            "Remediation Steps:\n"
            "1. Immediately disconnect laptop from AC power charger and shut down the machine.\n"
            "2. Store device in a fire-retardant safety bag or cool, non-combustible area.\n"
            "3. Do not ship via standard air courier; label as damaged lithium battery.\n"
            "4. Dispatch emergency replacement laptop to employee.\n"
            "5. Have certified IT hardware technician disassemble chassis and safely recycle degraded battery."
        ),
        "source": "IT Environmental Health & Safety Manual",
    },
    {
        "doc_id": "KB-SEC-01",
        "title": "Suspected Phishing Email Triage and Domain Quarantine",
        "category": "Security",
        "tags": "security, phishing, email, spam, credentials, spoofing, dkim, spf",
        "content": (
            "Symptoms: Employee reports suspicious email with gift card request, fake invoice, or cloned login link.\n"
            "Probable Cause: Spear-phishing campaign bypassing email gateway or display name spoofing.\n"
            "Remediation Steps:\n"
            "1. Extract full RFC-822 email headers and inspect SPF, DKIM, and DMARC authentication verdicts.\n"
            "2. Check sender IP address on AbuseIPDB and VirusTotal.\n"
            "3. Search Exchange / Google Workspace message trace to identify how many other employees received the same email.\n"
            "4. Execute automated tenant-wide soft-delete (ZAP) to purge the email from all employee inboxes.\n"
            "5. Block the malicious sending domain and destination URLs on perimeter firewall and web proxy.\n"
            "6. If user clicked the link or entered credentials, trigger immediate password reset and revoke active SSO sessions."
        ),
        "source": "Security Operations Center (SOC) Playbook",
    },
    {
        "doc_id": "KB-SEC-02",
        "title": "Endpoint Ransomware Containment and Network Isolation",
        "category": "Security",
        "tags": "ransomware, malware, security, containment, isolation, edr, crowdstrike",
        "content": (
            "Symptoms: Files modified with unfamiliar extension (e.g. .locked), ransom note text file on desktop, or EDR alert.\n"
            "EMERGENCY PROTOCOL:\n"
            "1. Immediately isolate endpoint from network via CrowdStrike Falcon / Defender EDR console. Disconnect physical Ethernet and disable Wi-Fi.\n"
            "2. Do NOT power off or reboot machine — preserve RAM volatile memory for forensic acquisition.\n"
            "3. Revoke employee Active Directory user credentials and invalidate all Kerberos/OAuth tokens.\n"
            "4. Check centralized file shares and restore affected volumes from immutable shadow copies / snapshots.\n"
            "5. Identify patient zero intrusion vector (RDP, phishing macro, exploited VPN endpoint).\n"
            "6. Notify CISO and legal team per incident response protocol."
        ),
        "source": "Cybersecurity Incident Response Playbook",
    },
    {
        "doc_id": "KB-AUTH-01",
        "title": "SAML Single Sign-On (SSO) Signature Verification and Certificate Expiry",
        "category": "Authentication",
        "tags": "sso, saml, okta, azure ad, authentication, certificate, signature, 400",
        "content": (
            "Symptoms: Users receive 'SAML response signature verification failed' or 'Error 400: invalid_request' on login.\n"
            "Probable Cause: IdP (Identity Provider) X.509 token signing certificate expired or clock skew between servers.\n"
            "Remediation Steps:\n"
            "1. Check Okta / Azure AD Enterprise Application 'SAML Signing Certificate' status.\n"
            "2. If expired, generate new certificate in IdP and export the Base64 X.509 certificate.\n"
            "3. Upload the new certificate to the Service Provider (SP) metadata settings.\n"
            "4. Verify that server system clocks on both IdP and SP are synchronized with NTP (within 120 seconds).\n"
            "5. Ensure EntityID and Assertion Consumer Service (ACS) URL match exactly (case-sensitive)."
        ),
        "source": "Identity and Access Management (IAM) Runbook",
    },
    {
        "doc_id": "KB-AUTH-02",
        "title": "Multi-Factor Authentication (MFA) Fatigue and Lost Device Recovery",
        "category": "Authentication",
        "tags": "mfa, 2fa, duo, authenticator, lockout, mobile, push, reset",
        "content": (
            "Symptoms: User flooded with repeated push approval notifications (MFA fatigue) or lost phone with 2FA app.\n"
            "Probable Cause: Adversary in possession of valid username/password attempting push bombing, or lost physical token.\n"
            "Remediation Steps:\n"
            "1. In case of suspected MFA fatigue attack, immediately disable user account and reset primary password.\n"
            "2. For lost devices, verify user identity via manager voice confirmation or video call.\n"
            "3. Deregister old mobile device from Azure AD / Okta / Duo user profile to invalidate pushed tokens.\n"
            "4. Generate a temporary One-Time Bypass Code valid for 8 hours.\n"
            "5. Guide employee through enrollment of replacement corporate mobile device.\n"
            "6. Enforce number matching on MFA prompts to permanently neutralize MFA fatigue."
        ),
        "source": "Identity and Access Management (IAM) Runbook",
    },
    {
        "doc_id": "KB-APP-01",
        "title": "Microservice 500 Internal Server Error and 504 Gateway Timeout Triage",
        "category": "Application",
        "tags": "500, 504, api, microservice, gateway, kubernetes, timeout, nginx, ingress",
        "content": (
            "Symptoms: External customers or frontend SPA receiving HTTP 500 or 504 Gateway Timeout from backend APIs.\n"
            "Probable Cause: Upstream backend service crashed, database query timing out, or Kubernetes pod OOMKilled.\n"
            "Remediation Steps:\n"
            "1. Check Kubernetes pod status: 'kubectl get pods -n production -l app=api' — look for CrashLoopBackOff or high restart count.\n"
            "2. Check pod termination reason: 'kubectl describe pod <pod_name>' — verify if killed with Exit Code 137 (OOM).\n"
            "3. Inspect service stdout/stderr logs for unhandled exceptions or database connection pool timeouts.\n"
            "4. If upstream response timeout exceeds Nginx ingress proxy_read_timeout (default 60s), scale backend replicas or optimize slow query.\n"
            "5. Temporarily scale deployment replicas: 'kubectl scale deployment api --replicas=6'."
        ),
        "source": "Site Reliability Engineering (SRE) Handbook",
    },
    {
        "doc_id": "KB-APP-02",
        "title": "NodeJS and Python Backend Memory Leak Remediation",
        "category": "Application",
        "tags": "memory leak, oom, heap, python, nodejs, docker, garbage collection",
        "content": (
            "Symptoms: Application container memory steadily increases without stabilizing, eventually getting killed by Linux OOM killer.\n"
            "Probable Cause: Dangling event listeners in Node.js, unclosed file descriptors, or accumulating data structures in global scope.\n"
            "Remediation Steps:\n"
            "1. Capture heap snapshot using Node.js '--inspect' or Python 'tracemalloc'.\n"
            "2. Identify retained objects with highest shallow/retained size.\n"
            "3. Ensure all streaming file uploads or HTTP response streams are piped with explicit 'finish' or 'close' handlers.\n"
            "4. Set container memory limit appropriately with '--max-old-space-size' in Node.js.\n"
            "5. Configure Kubernetes Horizontal Pod Autoscaler based on memory and restart pods gracefully before hard OOM limit."
        ),
        "source": "Site Reliability Engineering (SRE) Handbook",
    },
]


def get_all_knowledge_docs():
    """
    Returns the standard knowledge corpus.
    """
    return KNOWLEDGE_DOCUMENTS_CORPUS
