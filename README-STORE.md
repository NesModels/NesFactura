# Factura — Publication Microsoft Store via PWABuilder

## Structure du package

```
factura-pwa/
├── index.html               ← Application complète (432 Ko, standalone)
├── manifest.json            ← Manifeste PWA
├── sw.js                    ← Service Worker (cache offline)
├── icons/
│   ├── favicon.ico          ← 16/32/48/256px
│   ├── icon-72.png … icon-1024.png
│   ├── icon-512-maskable.png
│   └── icon-1024-maskable.png
└── screenshots/
    ├── screenshot-1.png     ← 1280×800 (à remplacer par vrais screenshots)
    └── screenshot-2.png     ← 1280×800 (à remplacer par vrais screenshots)
```

## Étapes de publication

### 1. Héberger l'application (HTTPS obligatoire)
- **GitHub Pages** : pousser le dossier dans un repo public
- **Netlify / Vercel** : glisser-déposer le dossier

### 2. Remplacer les screenshots
Remplacez `screenshots/*.png` par de vraies captures 1280×800 px.

### 3. PWABuilder → MSIX
1. Aller sur https://www.pwabuilder.com
2. Entrer votre URL HTTPS
3. Package For Stores → Microsoft Store → télécharger le .zip MSIX

### 4. Microsoft Partner Center
1. https://partner.microsoft.com/dashboard
2. Réserver le nom : **Factura Gestion Commerciale**
3. Soumettre le MSIX
4. Catégorie : Productivité > Finance & comptabilité

### Mise à jour de l'app
Déployez simplement le nouveau `index.html` sur votre hébergeur.
Les utilisateurs reçoivent la mise à jour automatiquement au prochain lancement.
Soumission Store uniquement si manifest.json ou icônes changent.

### URL Microsoft Store à mettre à jour
Une fois publié, remplacez l'URL dans factura.html (landing) :
  https://apps.microsoft.com/store/detail/factura
→ par l'URL exacte attribuée par Microsoft (avec l'ID numérique).
