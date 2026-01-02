# Database Migrations

This directory contains incremental database migrations for DocGuard.

## Running Migrations

### For New Databases
Run the complete schema:
```bash
psql -h <host> -U <user> -d <database> -f supabase/schema.sql
```

### For Existing Databases
Run migrations incrementally:
```bash
psql -h <host> -U <user> -d <database> -f supabase/migrations/0001_add_activity_feed_view.sql
```

## Migration Files

| File | Version | Description |
|------|---------|-------------|
| `20250101_add_evidence_bucket.sql` | 0.4.0 | Adds evidence bucket for CAC registry |
| `0001_add_activity_feed_view.sql` | 0.6.0 | Creates activity_feed view for Dashboard |

## Creating New Migrations

1. Create file: `supabase/migrations/XXXX_description.sql`
2. Number sequentially (0001, 0002, etc.)
3. Add `-- Version: X.X.X` header
4. Document what changed
5. Update this README

## Best Practices

- **Incremental**: Migrations should be additive, not destructive
- **Idempotent**: Use `CREATE OR REPLACE` where possible
- **Versioned**: Include version number in migration file
- **Tested**: Test on development database before production
