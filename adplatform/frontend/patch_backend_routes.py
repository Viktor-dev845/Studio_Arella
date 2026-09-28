import re

filepath = r'..\backend\src\routes\index.ts'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Add import for leadController
import_str = "import { submitLead, getLeads } from '../controllers/leadController';\n"
if "submitLead" not in content:
    content = content.replace(
        "import { googleCallback, googleOneTap } from '../controllers/googleAuthController';",
        "import { googleCallback, googleOneTap } from '../controllers/googleAuthController';\n" + import_str
    )

# Add routes
routes_str = """
// Ad Leads
router.post('/leads', submitLead);
router.get('/leads/admin', authenticate, getLeads);
"""
if "/leads" not in content:
    # insert before module.exports or export default router
    content = content.replace("export default router;", routes_str + "\nexport default router;")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Added lead routes")
