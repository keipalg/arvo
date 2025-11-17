# Data Management Scripts

Scripts for generating, exporting, and importing historical data for user accounts.

## Available Scripts

### 1. export-user-data.ts

Export all data for a specific user and month to a JSON file.

**Usage:**
```bash
npm run export-data -- --userId="<user-uuid>" --month="<YYYY-MM>" --output="<filename.json>"
```

**Example:**
```bash
npm run export-data -- --userId="019a8a84-c7aa-750b-8d12-ab3618e219a4" --month="2025-11" --output="november-2025.json"
```

**What it exports:**
- Product types, material types, user preferences
- Materials and supplies, goods
- Production batches
- Sales and sale details
- Studio overhead expenses, operational expenses
- Material inventory transactions
- Reference data (units, statuses, channels, etc.)

**Note:** Image/file fields are excluded from export (e.g., `good.image`, `operational_expense.attach_recipt`)

---

### 2. import-user-data.ts

Import previously exported data into a new (or existing) user account.

**Usage:**
```bash
npm run import-data -- --userId="<user-uuid>" --files="<file1.json,file2.json>"
```

**Example (single file):**
```bash
npm run import-data -- --userId="new-user-uuid" --files="november-2025.json"
```

**Example (multiple files):**
```bash
npm run import-data -- --userId="new-user-uuid" --files="june-2025.json,july-2025.json,august-2025.json"
```

**What it does:**
- Clears existing data for the target month(s)
- Generates new UUIDs for all records
- Maintains relationships between records (foreign keys)
- Imports in correct dependency order
- Preserves sales numbers from original data

**Important:**
- The script will DELETE existing data for the target month before importing
- Reference data (units, statuses, channels) must already exist in the database
- Image/file fields will be set to null

---

## Complete Workflow Example

### Generating 6 Months of Historical Data

```bash
# Month 1: Generate data in app UI (creates November 2025 data)
# Then export it
npm run export-data -- --userId="user-123" --month="2025-11" --output="november-2025.json"

# Month 2: Generate more data in app UI
# Then export it
npm run export-data -- --userId="user-123" --month="2025-11" --output="october-2025.json"

# Repeat for 6 months...

# Later: Import all 6 months into a clean user account
npm run import-data -- --userId="new-user-456" --files="june-2025.json,july-2025.json,august-2025.json,september-2025.json,october-2025.json,november-2025.json"
```

---

## File Structure

```
scripts/data-management/
├── export-user-data.ts          # Export script
├── import-user-data.ts          # Import script
├── shared/
│   ├── types.ts                 # TypeScript type definitions
│   ├── validation.ts            # Input validation helpers
│   ├── date-utils.ts            # Date manipulation utilities
│   └── uuid-utils.ts            # UUID generation and mapping
└── README.md                    # This file
```

---

## Troubleshooting

### "User not found" error
- Verify the userId is correct
- Ensure the user exists in the database

### "File not found" error
- Check the file path is correct
- Ensure you're running the command from the backend directory

### "Foreign key constraint violation"
- Ensure reference data exists (units, statuses, channels, productionStatuses, notificationTypes)
- Run database seed scripts if needed

### Import shows "Deleted 0 existing records"
- This is normal for first-time imports (clean slate)
- The script clears existing data for the target month before importing

---

## Notes

- All operations are wrapped in transactions for safety
- Errors will rollback changes automatically
- Scripts log detailed progress for debugging
- Export files are pretty-printed JSON for readability
- UUID mappings preserve all relationships during import
