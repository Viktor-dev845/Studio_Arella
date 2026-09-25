import re

with open('app/finances/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    "{fundStep === 'otp' && Pay with  card}",
    "{fundStep === 'otp' && `Pay with ${savedCards.find((c) => c.id === selectedCardId)?.bank || savedCards.find((c) => c.id === selectedCardId)?.card_type || 'Wema'} card`}"
)

with open('app/finances/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
