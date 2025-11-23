# Scripts

This directory contains utility and migration scripts for the backend.

## Available Scripts

### migrateJuicesCategory.js
One-time migration script to merge 'Juices' category into 'Juices & Beverages'.

**Usage:**
```bash
node scripts/migrateJuicesCategory.js
```

**Note:** This migration has already been applied. The seedDatabase.js now uses 'Juices & Beverages' by default.

## Main Scripts (in root)

- **seedDatabase.js** - Seeds the database with food items. Run this to populate the database.
  ```bash
  node seedDatabase.js
  ```

