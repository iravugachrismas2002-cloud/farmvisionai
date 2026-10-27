# PostgreSQL local TCP configuration notes

## Observed local configuration

- PostgreSQL 18 Windows service: `postgresql-x64-18`, reported Running.
- Service data directory: `C:\Program Files\PostgreSQL\18\data`.
- `postgresql.conf`: `listen_addresses = '*'`; `port = 5432`.
- `pg_hba.conf` already has loopback TCP rules for IPv4 `127.0.0.1/32` and IPv6 `::1/128`, both using `scram-sha-256`.
- The service had no TCP listener on port 5432 when checked.
- Planned safe change: set `listen_addresses = 'localhost'`; do not broaden `pg_hba.conf`. This keeps the TCP listener on loopback and retains password-based SCRAM authentication.
- `listen_addresses` and `port` take effect only after a PostgreSQL server restart. No schema/data changes are part of this operation.

## Official sources

- PostgreSQL 18 connection settings: https://www.postgresql.org/docs/18/runtime-config-connection.html
- PostgreSQL 18 `pg_hba.conf`: https://www.postgresql.org/docs/18/auth-pg-hba-conf.html

The official docs state that `localhost` permits loopback-only TCP, `*` listens on all interfaces, port defaults to 5432, and these connection settings require a restart. On Windows, `pg_hba.conf` changes are applied for subsequent connections, but no HBA change is needed because the loopback SCRAM rules are already present.
