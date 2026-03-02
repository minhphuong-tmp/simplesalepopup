---
description: Test the Shopify app in browser using Playwright CLI
---

Use Playwright CLI to test the app in browser. Read `shopify.app.toml` first to get store and app info.

## What to Test

Based on the argument provided:

| Argument | Action |
|----------|--------|
| `admin` or empty | Open and test embedded admin app |
| `storefront` | Open storefront and test widgets |
| `theme` | Open theme editor for app extension |
| `checkout` | Test checkout flow with extensions |
| `cart` | Add product to cart and test |
| `order` | Create test order in admin |
| `settings` | Open Shopify admin settings |

## Testing Steps

### 1. Read Config
```
Read shopify.app.toml to get:
- dev_store_url → store name
- name → app handle (kebab-case)
```

### 2. Construct URLs
- **Admin App**: `https://admin.shopify.com/store/{store}/apps/{app-handle}/embed`
- **Storefront**: `https://{dev_store_url}`
- **Theme Editor**: `https://admin.shopify.com/store/{store}/themes/current/editor`

### 3. Test Flow
```bash
# 1. Open browser with persistent session
playwright-cli open --headed --persistent "URL"
# 2. Take snapshot to get element refs
playwright-cli snapshot
# 3. Check console errors
playwright-cli console error
# 4. Interact with elements (use refs from snapshot)
playwright-cli click e5
# 5. Navigate to another page
playwright-cli goto "URL"
# 6. Screenshot if needed
playwright-cli screenshot
# 7. Close when done
playwright-cli close
```

### 4. Report Results
- Screenshot if needed
- Console errors found
- Network request issues
- Backend logs from `firebase-debug.log`

## Reference
See `.claude/skills/shopify-testing/skill.md` for detailed workflows.