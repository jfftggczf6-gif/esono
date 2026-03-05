#!/bin/bash
# ECOBRIC BÉNIN - Full workflow: insert data + trigger all analyses
# User ID: 8, Token obtained from registration

set -e
TK="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjgsImVtYWlsIjoiZWNvYnJpY0BlY29icmljLWJlbmluLmJqIiwidXNlclR5cGUiOiJlbnRyZXByZW5ldXIiLCJleHAiOjE3NzMyNzQ2NjJ9.g56LpIooNDmhTKhurN6cToWDnYxzBXaqFvv47IYSeiU"
BASE="http://localhost:3000"
USER_ID=8

echo "═══════════════════════════════════════════════════"
echo "  ECOBRIC BÉNIN SARL — Full Workflow Generation"
echo "═══════════════════════════════════════════════════"

# ── STEP 1: Submit BMC answers ──
echo ""
echo "▶ STEP 1: Submitting BMC questionnaire answers..."
curl -s -X POST "$BASE/api/module/submit-answers" \
  -H "Authorization: Bearer $TK" \
  -H "Content-Type: application/json" \
  -d '{
    "module_code": "step1_business_model",
    "answers": [
      {
        "question_number": 1,
        "answer": "ECOBRIC BÉNIN transforme les déchets plastiques collectés dans les villes béninoises en pavés et briques de construction écologiques, vendus aux mairies, promoteurs et particuliers."
      },
      {
        "question_number": 2,
        "answer": "Les mairies et collectivités locales béninoises (commandes de pavage des rues et places publiques). Second segment : promoteurs immobiliers privés (constructions économiques, résidences R+2 à R+4) et ONG/projets de développement. Profil décideur : maire ou directeur technique municipal. Localisation : Cotonou, Porto-Novo, Abomey-Calavi, Parakou. Budget annuel travaux : 50–500 millions XOF."
      },
      {
        "question_number": 3,
        "answer": "Pavés de voirie (850–1200 XOF/unité) et briques de construction (1500 XOF/unité) fabriqués à partir de déchets plastiques recyclés. 30% moins chers que le béton conventionnel, 3× plus résistants à l eau. Double impact : dépollution plastique + matériaux de construction abordables. Modèle de reverse supply chain avec paiement des collecteurs. Certification qualité BRICOP. Partenariats contractuels avec 4 mairies béninoises."
      },
      {
        "question_number": 4,
        "answer": "Vente directe B2B aux mairies via appels d offres publics et contrats-cadres annuels négociés par le Responsable Commercial. Acquisition : réseaux sociaux, recommandation, terrain/prospection. Livraison sur chantier par camion benne ou transport sous-traité (5 à 10 jours ouvrés)."
      },
      {
        "question_number": 5,
        "answer": "Relation personnalisée et assistance continue. Rapport de suivi chantier transmis à la mairie. Garantie produit 5 ans sur les pavés. Renouvellement automatique des contrats-cadres annuels (4 mairies). Proposition de collecte des déchets plastiques du chantier livré. Invitation aux événements de sensibilisation environnementale (2/an)."
      },
      {
        "question_number": 6,
        "answer": "5 lignes de produits/services : (1) Pavé plastique standard 20×20×8cm — 850 XOF/unité. (2) Pavé plastique premium anti-glissant — 1200 XOF/unité. (3) Brique plastique mur 25×12×10cm — 1500 XOF/unité. (4) Service collecte déchets plastiques — 15000 XOF/tonne (contrat mensuel). (5) Formation & certification collecteurs — 35000 XOF/session. CA historique : N-2=28M, N-1=52M, N=89M XOF. Objectif N+1=130M XOF."
      },
      {
        "question_number": 7,
        "answer": "Humaines (18 employés) : DG, Responsable Production, Responsable Commercial, 4 Opérateurs machines, 6 Collecteurs-trieurs terrain, 2 Chauffeurs, 1 Comptable, 1 Agent Qualité, 1 Gardien. Matérielles : machine broyeur industriel (9.5M XOF), 2 machines extrusion-compression (12M XOF), camion benne (7.2M XOF), usine 800 m² à Cotonou. Immatérielles : certification BRICOP, marque ECOBRIC®, réseau 120 collecteurs agréés, 4 contrats-cadres mairies, données traçabilité plastique."
      },
      {
        "question_number": 8,
        "answer": "1. Collecte et tri des déchets plastiques via réseau de 120 collecteurs agréés (ACTIVITÉ CRITIQUE). 2. Broyage, lavage et granulation du plastique à l usine de Cotonou. 3. Thermo-compression des granulés en pavés et briques (2 machines industrielles). 4. Contrôle qualité et certification. 5. Commercialisation et livraison. 6. Formation et agrément des collecteurs communautaires. 7. Suivi de l impact environnemental."
      },
      {
        "question_number": 9,
        "answer": "Fournisseurs machines : ENERPAT (broyeurs, Chine), MAPES Machinery (presses, Espagne). Matière première : déchets plastiques via réseau propre (coût quasi-nul). Distribution : 4 mairies partenaires (Cotonou, Porto-Novo, Abomey-Calavi, Parakou). Logistique : GTB. ONG : BENIN PROPRE, Récup-Action Bénin. Financeurs : FECECAM (prêt 15M XOF, 9%), AFD (subvention 8M XOF), PNUD (prospection). Institutions : ABE. COÛTS FIXES : 3.86M XOF/mois (salaires 3M, loyer 350K, énergie 120K, assurances 100K, marketing 120K). COÛTS VARIABLES : 4.13M XOF/mois (achats plastique 2.8M, énergie machine 650K, chimiques 280K, transport 320K, emballages 80K). Coût total M1 : ~7.99M XOF."
      }
    ]
  }' | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'  BMC: {json.dumps({k:d.get(k) for k in [\"success\",\"message\",\"analysisReady\"]}, ensure_ascii=False)}')" 2>&1 || echo "  BMC submit done"

# ── STEP 2: Submit SIC answers ──
echo ""
echo "▶ STEP 2: Submitting SIC questionnaire answers..."
curl -s -X POST "$BASE/api/module/submit-answers" \
  -H "Authorization: Bearer $TK" \
  -H "Content-Type: application/json" \
  -d '{
    "module_code": "step1_social_impact",
    "answers": [
      {
        "question_number": 1,
        "answer": "Le Bénin produit environ 500000 tonnes de déchets plastiques par an, dont seulement 5% recyclés. Les déchets envahissent les rues de Cotonou et Porto-Novo, bouchent les canaux d évacuation (inondations), polluent les plages et lagunes. Portée nationale. Critique car : urbanisation rapide (+4.1%/an), 40% des rues de Cotonou non pavées, inondations ont causé 120000 sinistrés en 2023, aucune filière industrielle de recyclage à grande échelle."
      },
      {
        "question_number": 2,
        "answer": "Bénéficiaires directs : 120 collecteurs plastique agréés (revenus 25000–45000 XOF/mois), habitants des quartiers pavés (mobilité, réduction inondations). Indirects : 50000 habitants zones collecte (réduction pollution visible), enfants (réduction maladies eaux stagnantes), femmes collectrices. Vulnérabilité : collecteurs informels gagnent 3000–8000 XOF/jour irrégulièrement, sans contrat ni protection. Intermédiaires captent 60–70% de la valeur. Habitants zones non pavées subissent inondations mai–octobre."
      },
      {
        "question_number": 3,
        "answer": "ECOBRIC collecte les déchets plastiques (PET, HDPE, PP) via 120 collecteurs communautaires, puis transforme par broyage et thermo-compression en pavés (850–1200 XOF) et briques (1500 XOF). Différenciation : double impact (dépollution + construction abordable), reverse supply chain avec paiement collecteurs, certification BRICOP, partenariats 4 mairies. Activités impact : formation collecteurs (programme 2 jours), suivi environnemental (tonnes plastique recyclé, CO₂ évité)."
      },
      {
        "question_number": 4,
        "answer": "Court terme (0–12 mois) : 120 collecteurs actifs avec revenus stables, 40 tonnes plastique recyclé/mois (480t/an), 2 contrats mairies additionnels, 25000 m² rues pavées, 14 emplois industriels, 48 tonnes CO₂ évitées. Moyen terme (1–3 ans) : 160 collecteurs (+40%), 85t/mois recyclé, 90000 m² voiries, briques (30% CA), 35 emplois dont 55% femmes, 200t CO₂/an. Long terme (3–5 ans) : 300 collecteurs 6 villes (Bénin+Togo), 180t/mois, 250000 m², 2ème usine, 70 emplois 60% femmes, 450t CO₂/an, réplication 2 pays, ISO 14001."
      },
      {
        "question_number": 5,
        "answer": "3 indicateurs clés : 1. Tonnes de plastique collecté et recyclé — Cible 1 an : 480 tonnes (pesées certifiées mensuelles). 2. Revenus collecteurs communautaires — Cible : 35000 XOF/mois/collecteur (registre de paiement mensuel). 3. Mètres carrés de voirie pavée — Cible : 25000 m² (contrats livraison mairies). Méthodologie : pesées certifiées mensuelles, enquête satisfaction trimestrielle, bilan environnemental annuel indépendant (ABE), rapport impact AFD, Google Sheets + QR codes traçabilité."
      },
      {
        "question_number": 6,
        "answer": "Risques : 1. Concurrence acheteurs informels plastique (Chine/Inde). 2. Retards paiement mairies (60–120 jours). 3. Pollution secondaire eaux de lavage. 4. Contrefaçon pavés sans certification. 5. Lobbying BTP traditionnel. 6. Fluctuation prix pétrole. Populations impactées négativement : producteurs béton conventionnel (15–20 acteurs filière informelle Cotonou). Mitigations : prix plancher collecteurs (+15%), pénalités retard + COFACE, station traitement eaux (800K XOF), dépôt marque OAPI, diversification briques."
      },
      {
        "question_number": 7,
        "answer": "ONG : BENIN PROPRE (mobilisation collecteurs), Récup-Action Bénin (sensibilisation). Collectivités : Direction Services Techniques 4 mairies. Financeurs : FECECAM (15M XOF, 9%), AFD (8M XOF subvention économie circulaire), PNUD (prospection). Institutions : ABE (certification, suivi). Fournisseurs machines : ENERPAT, MAPES Machinery. Logistique : GTB."
      },
      {
        "question_number": 8,
        "answer": "Impact au CŒUR DU MODÈLE : la matière première (déchets plastiques) est le problème environnemental lui-même. Sans ramassage, pas de production — et sans impact, pas de différenciation commerciale. Plus on grandit, plus l impact augmente. Risque conflit limité mais réel : en forte demande, tentation d acheter plastiques vierges. Mitigation : engagement contractuel charte ECOBRIC (100% matière recyclée), audité annuellement par ABE."
      },
      {
        "question_number": 9,
        "answer": "Budget formation collecteurs : 300000 XOF/trimestre. Plateforme traçabilité plastique (QR code/sac) : 1.2M XOF. Temps dédié impact : 15% temps DG et Responsable Commercial. Rapport environnemental trimestriel aux mairies et bailleurs (AFD). Impact cible 3 ans : 160 collecteurs, 85000 tonnes recyclées, 250000 m² pavés, 180000 bénéficiaires directs et indirects."
      }
    ]
  }' | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'  SIC: {json.dumps({k:d.get(k) for k in [\"success\",\"message\",\"analysisReady\"]}, ensure_ascii=False)}')" 2>&1 || echo "  SIC submit done"

echo ""
echo "✅ Steps 1-2 complete: BMC + SIC answers submitted"
