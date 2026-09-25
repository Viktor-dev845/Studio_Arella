with open('app/campaigns/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Make the Continue button in Billing modal go directly to our new card-confirm Wema modal
content = content.replace("setWizardStep('card');", "setWizardStep('card-confirm');")

with open('app/campaigns/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
