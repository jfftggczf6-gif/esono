// ═══════════════════════════════════════════════════════════════
// BMC Deliverable Engine — Full Professional Deliverable Generator
// Réplique du format BMC_GOTCHE_FINAL.pdf
// Sections : Header, Score, Canvas Vue d'Ensemble, Diagnostic Expert,
//            Forces, Points de Vigilance, SWOT, Recommandations, Footer
// ═══════════════════════════════════════════════════════════════

// ─── Types ───
export interface BmcDeliverableData {
  companyName: string
  entrepreneurName: string
  sector: string
  location: string
  country: string
  brandName: string
  tagline: string
  analysisDate: string
  answers: Map<number, string>
}

interface BmcBlocScore {
  key: string
  label: string
  score: number      // 0-100
  comment: string
}

interface BmcForce {
  title: string
  description: string
}

interface BmcVigilance {
  title: string
  description: string
  action: string
}

interface SwotData {
  forces: string[]
  faiblesses: string[]
  opportunites: string[]
  menaces: string[]
}

interface BmcRecommendation {
  horizon: string
  horizonLabel: string
  items: string[]
}

interface BmcAnalysis {
  globalScore: number
  blocScores: BmcBlocScore[]
  forces: BmcForce[]
  vigilances: BmcVigilance[]
  swot: SwotData
  recommendations: BmcRecommendation[]
  maturityChecks: { label: string, status: 'ok' | 'warning' | 'action' }[]
  propositionDeValeur: string
  caMensuel: string
  margeBrute: string
  coutTotal: string
}

// ─── Color Palette (from PDF analysis) ───
const COLORS = {
  primary: '#2d6a4f',           // Dark green-teal (BMC brand)
  primaryLight: '#95d5b2',      // Light green
  primaryBg: '#e8f5e9',
  accent: '#1565c0',            // Blue
  accentLight: '#e3f2fd',
  orange: '#e65100',
  orangeLight: '#fff3e0',
  red: '#c62828',
  redLight: '#ffebee',
  textDark: '#1a2332',
  textMedium: '#444444',
  textLight: '#666666',
  textMuted: '#999999',
  bgCard: '#ffffff',
  bgPage: '#f8fafb',
  border: 'rgba(0,0,0,0.08)',
}

// ─── BMC Section mapping (Question ID → Label) ───
const BMC_SECTIONS: Record<number, { key: string, label: string, icon: string }> = {
  1: { key: 'segments_clients', label: 'Segments Clients', icon: '👥' },
  2: { key: 'proposition_valeur', label: 'Proposition de Valeur', icon: '💎' },
  3: { key: 'canaux', label: 'Canaux', icon: '📦' },
  4: { key: 'relations_clients', label: 'Relations Clients', icon: '🤝' },
  5: { key: 'flux_revenus', label: 'Flux de Revenus', icon: '💰' },
  6: { key: 'ressources_cles', label: 'Ressources Clés', icon: '🔧' },
  7: { key: 'activites_cles', label: 'Activités Clés', icon: '⚙️' },
  8: { key: 'partenaires_cles', label: 'Partenaires Clés', icon: '🤲' },
  9: { key: 'structure_couts', label: 'Structure de Coûts', icon: '📊' },
}

// ─── Canvas Grid Positions (Classic BMC layout) ───
const CANVAS_LAYOUT: { qId: number, gridArea: string }[] = [
  { qId: 8, gridArea: '1 / 1 / 3 / 2' },   // Partenaires Clés (top-left)
  { qId: 7, gridArea: '1 / 2 / 2 / 3' },   // Activités Clés (mid-left top)
  { qId: 6, gridArea: '2 / 2 / 3 / 3' },   // Ressources Clés (mid-left bottom)
  { qId: 2, gridArea: '1 / 3 / 3 / 4' },   // Proposition de Valeur (center)
  { qId: 4, gridArea: '1 / 4 / 2 / 5' },   // Relations Clients (mid-right top)
  { qId: 3, gridArea: '2 / 4 / 3 / 5' },   // Canaux (mid-right bottom)
  { qId: 1, gridArea: '1 / 5 / 3 / 6' },   // Segments Clients (right)
  { qId: 9, gridArea: '3 / 1 / 4 / 3' },   // Structure de Coûts (bottom-left)
  { qId: 5, gridArea: '3 / 3 / 4 / 6' },   // Flux de Revenus (bottom-right)
]

// ─── Helper: Extract bullet points ───
function extractBullets(text: string): string[] {
  if (!text) return []
  const lines = text.split(/[\n\r]+|[•\-–›]\s*|\d+[\.\)]\s*/).map(l => l.trim()).filter(l => l.length > 5)
  if (lines.length <= 1 && text.length > 50) {
    return text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 10).slice(0, 6)
  }
  return lines.slice(0, 8)
}

// ─── Helper: Text quality scoring ───
function textQuality(text: string): number {
  if (!text || text.trim().length === 0) return 0
  const t = text.trim()
  let score = 0
  if (t.length > 20) score += 15
  if (t.length > 80) score += 15
  if (t.length > 200) score += 10
  if (t.length > 400) score += 10
  if (/\d/.test(t)) score += 15
  if (/\d+\s*%|FCFA|XOF|CFA/i.test(t)) score += 5
  if (/[•\-–›]\s|^\d+[\.\)]/m.test(t)) score += 5
  const hasSpecific = /client|segment|revenu|coût|canal|partenair|activit|ressourc|livrai|produit|prix|marg/i.test(t)
  if (hasSpecific) score += 10
  if (/B2B|B2C|SaaS|marketplace|e-commerce/i.test(t)) score += 5
  return Math.min(score, 100)
}

// ─── Helper: Extract financial data ───
function extractFinancials(answers: Map<number, string>): { ca: string, marge: string, cout: string } {
  const revenueText = answers.get(5) ?? ''
  const costText = answers.get(9) ?? ''

  // Try to find CA
  const caMatch = revenueText.match(/(\d[\d\s,.]*)\s*(FCFA|XOF|CFA|€|\$)/i)
    ?? revenueText.match(/CA.*?(\d[\d\s,.]*)/i)
    ?? revenueText.match(/(\d[\d\s,.]*)\s*\/\s*mois/i)
  const ca = caMatch ? caMatch[1].trim() : ''

  // Try to find margin
  const margeMatch = revenueText.match(/marge.*?(\d+)\s*%/i) ?? revenueText.match(/(\d+)\s*%.*marge/i)
  const marge = margeMatch ? margeMatch[1] + '%' : ''

  // Try to find total cost
  const coutMatch = costText.match(/total.*?(\d[\d\s,.]*)\s*(FCFA|XOF)/i)
    ?? costText.match(/(\d[\d\s,.]*)\s*(FCFA|XOF)/i)
  const cout = coutMatch ? coutMatch[1].trim() + ' ' + (coutMatch[2] ?? '') : ''

  return { ca, marge, cout }
}

// ─── Main Analysis Function ───
function analyzeBmc(answers: Map<number, string>): BmcAnalysis {
  const blocScores: BmcBlocScore[] = []

  // Score each bloc
  for (const [qIdStr, sec] of Object.entries(BMC_SECTIONS)) {
    const qId = Number(qIdStr)
    const answer = answers.get(qId) ?? ''
    const quality = textQuality(answer)

    let comment = ''
    if (quality >= 80) comment = 'Excellente description, détaillée et quantifiée'
    else if (quality >= 60) comment = 'Bonne description, quelques précisions possibles'
    else if (quality >= 40) comment = 'Description correcte, à enrichir avec des données concrètes'
    else if (quality > 0) comment = 'Description trop courte ou vague — ajoutez des détails'
    else comment = 'Non renseigné'

    // Specific comments per section
    if (qId === 2 && quality >= 60) comment = 'Claire, différenciante et vérifiable'
    if (qId === 7 && quality >= 60) comment = 'Maîtrisées, intégration verticale'
    if (qId === 6 && quality >= 60) comment = 'Solides mais à vérifier la dépendance personnes'
    if (qId === 1 && quality >= 60) comment = 'Identifiés, zone géographique à étendre'
    if (qId === 4 && quality >= 60) comment = 'Personnalisées mais à formaliser'
    if (qId === 5 && quality >= 50) comment = 'Récurrents, attention au mono-produit'
    if (qId === 8 && quality >= 50) comment = 'Identifiés, relations à formaliser'
    if (qId === 3 && quality >= 40) comment = 'Fonctionnels, manque de digital'
    if (qId === 9 && quality >= 40) comment = 'Exposée aux matières premières'

    blocScores.push({ key: sec.key, label: sec.label, score: quality, comment })
  }

  // Sort by score descending
  blocScores.sort((a, b) => b.score - a.score)

  // Global score
  const globalScore = blocScores.length > 0
    ? Math.round(blocScores.reduce((s, b) => s + b.score, 0) / blocScores.length)
    : 0

  // Forces
  const forces: BmcForce[] = []
  const propositionText = answers.get(2) ?? ''
  const activitesText = answers.get(7) ?? ''
  const segmentsText = answers.get(1) ?? ''
  const revenusText = answers.get(5) ?? ''
  const ressourcesText = answers.get(6) ?? ''

  if (activitesText.length > 100 && /intégr|chaîne|vertical|maîtris/i.test(activitesText)) {
    forces.push({ title: 'Intégration verticale complète', description: 'Maîtrise totale de la chaîne de valeur — contrôle de la qualité et des coûts à chaque étape. Avantage concurrentiel majeur.' })
  }
  if (propositionText.length > 50) {
    const propBullets = extractBullets(propositionText)
    forces.push({ title: 'Proposition de valeur claire et différenciante', description: propBullets[0] ?? 'Promesse simple, concrète et vérifiable. Exactement ce que le marché attend.' })
  }
  if (segmentsText.length > 50 && /croissanc|demande|march/i.test(segmentsText)) {
    forces.push({ title: 'Marché structurellement porteur', description: 'Marché en croissance avec une demande supérieure à l\'offre locale. Position géographique stratégique.' })
  }
  if (revenusText.length > 30 && /recurr|hebdo|mensuel|abonn/i.test(revenusText)) {
    forces.push({ title: 'Modèle récurrent', description: 'Récurrence naturelle des revenus qui stabilise le chiffre d\'affaires et améliore la prévisibilité.' })
  }
  if (ressourcesText.length > 30 && /marque|brand|TICIA/i.test(ressourcesText)) {
    forces.push({ title: 'Marque identifiable', description: 'Marque établie qui renforce la reconnaissance et la fidélisation client.' })
  }
  // Default forces if few detected
  if (forces.length < 2) {
    for (const bloc of blocScores.filter(b => b.score >= 60).slice(0, 3)) {
      if (!forces.some(f => f.title.toLowerCase().includes(bloc.label.toLowerCase()))) {
        forces.push({ title: `${bloc.label} solide`, description: bloc.comment })
      }
    }
  }

  // Vigilances
  const vigilances: BmcVigilance[] = []
  const coutText = answers.get(9) ?? ''
  const canauxText = answers.get(3) ?? ''
  const partenairesText = answers.get(8) ?? ''

  if (coutText && /maïs|matière|intrant/i.test(coutText)) {
    vigilances.push({ title: 'Dépendance matières premières', description: 'Les coûts de matières premières représentent une part significative. Toute fluctuation des prix impacte la marge.', action: 'Sécuriser des contrats d\'approvisionnement à prix fixe.' })
  }
  if (revenusText && !/divers|second|complém/i.test(revenusText)) {
    vigilances.push({ title: 'Mono-produit', description: 'L\'activité repose principalement sur un seul produit/service. Risque de concentration.', action: 'Diversifier progressivement l\'offre.' })
  }
  if (canauxText && !/digital|web|online|whatsapp|facebook|instagram/i.test(canauxText)) {
    vigilances.push({ title: 'Absence de digital', description: 'Aucun canal digital détecté. Dans un marché qui se digitalise, c\'est un manque visible.', action: 'Créer une présence digitale minimale (WhatsApp Business, réseaux sociaux).' })
  }
  if (segmentsText && /seul|unique|limit|2 ville|zone restreint/i.test(segmentsText)) {
    vigilances.push({ title: 'Concentration géographique', description: 'Zone géographique limitée. Le potentiel de croissance nécessite une expansion.', action: 'Expansion géographique progressive et maîtrisée.' })
  }
  if (partenairesText && !/contrat|formalis|accord/i.test(partenairesText)) {
    vigilances.push({ title: 'Relations fournisseurs non formalisées', description: 'Les relations avec les fournisseurs ne semblent pas contractualisées. Risque de rupture.', action: 'Contractualiser les relations avec les fournisseurs critiques.' })
  }
  // Default vigilances from low-score blocs
  for (const bloc of blocScores.filter(b => b.score < 50).slice(0, 3)) {
    if (!vigilances.some(v => v.title.toLowerCase().includes(bloc.label.toLowerCase()))) {
      vigilances.push({ title: `${bloc.label} à renforcer`, description: `Score ${bloc.score}% — ${bloc.comment}`, action: `Enrichir la description avec des données concrètes et quantifiées.` })
    }
  }

  // SWOT
  const swot: SwotData = {
    forces: forces.map(f => f.title),
    faiblesses: vigilances.map(v => v.title),
    opportunites: [
      'Expansion vers d\'autres villes / régions',
      'Diversification produits et services',
      'Digitalisation (WhatsApp Business, e-commerce)',
      'Croissance démographique = demande croissante',
      'Partenariats avec grandes surfaces / restaurants'
    ].slice(0, 5),
    menaces: [
      'Volatilité des prix des matières premières',
      'Risque sanitaire / réglementaire',
      'Entrée de concurrents industriels',
      'Dépendance financement externe',
      'Instabilité climatique / facteurs externes'
    ].slice(0, 5)
  }

  // Enrich SWOT from answers
  if (activitesText && /intégr/i.test(activitesText)) swot.forces.push('Intégration verticale (chaîne de valeur maîtrisée)')
  if (propositionText) swot.forces.push('Proposition de valeur claire')
  swot.forces = [...new Set(swot.forces)].slice(0, 6)

  // Recommendations
  const recommendations: BmcRecommendation[] = [
    {
      horizon: 'court_terme',
      horizonLabel: 'Court terme — Consolider les fondations',
      items: [
        'Sécuriser les approvisionnements via des contrats à prix fixe avec les fournisseurs.',
        'Structurer le suivi client avec un CRM simple (WhatsApp Business + tableau de suivi).',
        'Formaliser les processus pour réduire la dépendance aux personnes clés.',
        'Contractualiser les relations avec les fournisseurs critiques.'
      ]
    },
    {
      horizon: 'moyen_terme',
      horizonLabel: 'Moyen terme — Croissance maîtrisée',
      items: [
        'Diversifier les produits/services progressivement.',
        'Étendre la zone géographique vers de nouvelles localités.',
        'Créer une présence digitale professionnelle.',
        'Renforcer les fonds propres pour réduire la dépendance externe.'
      ]
    },
    {
      horizon: 'long_terme',
      horizonLabel: 'Long terme — Industrialisation et marque',
      items: [
        'Industrialiser et automatiser les processus de production.',
        'Développer la marque au niveau national avec un positionnement premium.',
        'Explorer l\'export sous-régional.',
        'Structurer une gouvernance formelle avec reporting financier régulier.'
      ]
    }
  ]

  // Maturity checks
  const maturityChecks: BmcAnalysis['maturityChecks'] = []
  if (propositionText.length > 50) maturityChecks.push({ label: 'Intégration verticale', status: 'ok' })
  else maturityChecks.push({ label: 'Intégration verticale', status: 'warning' })

  if (segmentsText && /croissanc|demande|march/i.test(segmentsText)) maturityChecks.push({ label: 'Marché porteur', status: 'ok' })
  else maturityChecks.push({ label: 'Marché porteur', status: 'warning' })

  if (revenusText && !/divers/i.test(revenusText)) maturityChecks.push({ label: 'Mono-produit', status: 'warning' })
  else maturityChecks.push({ label: 'Produit diversifié', status: 'ok' })

  if (canauxText && /digital|web/i.test(canauxText)) maturityChecks.push({ label: 'Présence digitale', status: 'ok' })
  else maturityChecks.push({ label: 'Digitalisation nécessaire', status: 'action' })

  const financials = extractFinancials(answers)
  const propositionDeValeur = propositionText.length > 0 ? extractBullets(propositionText)[0] ?? '' : ''

  return {
    globalScore,
    blocScores,
    forces: forces.slice(0, 5),
    vigilances: vigilances.slice(0, 5),
    swot,
    recommendations,
    maturityChecks,
    propositionDeValeur,
    caMensuel: financials.ca ? financials.ca + ' FCFA/mois' : '—',
    margeBrute: financials.marge || '—',
    coutTotal: financials.cout || '—'
  }
}

// ═══════════════════════════════════════════════════════════════
// MAIN: Generate Full BMC Deliverable HTML
// ═══════════════════════════════════════════════════════════════
export function generateFullBmcDeliverable(data: BmcDeliverableData): string {
  const { companyName, entrepreneurName, sector, location, country, brandName, tagline, answers } = data
  const analysis = analyzeBmc(answers)
  const dateStr = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const locationStr = [location, country].filter(Boolean).join(' — ')
  const sectorStr = sector || 'PME'

  const scoreColor = analysis.globalScore >= 80 ? COLORS.primary : analysis.globalScore >= 60 ? COLORS.accent : analysis.globalScore >= 40 ? COLORS.orange : COLORS.red

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Business Model Canvas — ${companyName}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: ${COLORS.primary};
      --primary-light: ${COLORS.primaryLight};
      --primary-bg: ${COLORS.primaryBg};
      --accent: ${COLORS.accent};
      --accent-light: ${COLORS.accentLight};
      --orange: ${COLORS.orange};
      --orange-light: ${COLORS.orangeLight};
      --red: ${COLORS.red};
      --red-light: ${COLORS.redLight};
      --text-dark: ${COLORS.textDark};
      --text-medium: ${COLORS.textMedium};
      --text-light: ${COLORS.textLight};
      --text-muted: ${COLORS.textMuted};
    }
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Inter',system-ui,sans-serif; background:#f8fafb; color:var(--text-dark); line-height:1.6; }
    .bmc-container { max-width:1200px; margin:0 auto; padding:0 24px; }

    /* ─── HEADER ─── */
    .bmc-header {
      background: linear-gradient(135deg, #1a2e28 0%, #2d6a4f 40%, #40916c 100%);
      padding: 48px 0 56px;
      color: white;
      position: relative;
      overflow: hidden;
    }
    .bmc-header::before {
      content:''; position:absolute; top:-50%; right:-10%;
      width:400px; height:400px; border-radius:50%; background:rgba(255,255,255,0.04);
    }
    .bmc-header__inner { position:relative; z-index:1; }
    .bmc-header__icon {
      width:56px; height:56px; background:rgba(255,255,255,0.15);
      border-radius:16px; display:flex; align-items:center; justify-content:center;
      font-size:24px; margin-bottom:16px; backdrop-filter:blur(8px);
    }
    .bmc-header__title { font-size:36px; font-weight:800; letter-spacing:-0.5px; margin-bottom:4px; }
    .bmc-header__company { font-size:18px; font-weight:600; opacity:0.95; }
    .bmc-header__meta { font-size:14px; font-weight:400; opacity:0.75; margin-top:4px; }
    .bmc-header__tags { display:flex; gap:8px; margin-top:16px; flex-wrap:wrap; }
    .bmc-header__tag { padding:4px 12px; border-radius:20px; font-size:12px; font-weight:600; background:rgba(255,255,255,0.15); backdrop-filter:blur(8px); }

    /* ─── SCORE HERO ─── */
    .bmc-score-hero {
      background:white; border-radius:20px; margin:-36px 24px 0;
      position:relative; z-index:10; box-shadow:0 8px 32px rgba(0,0,0,0.1);
      padding:32px 40px; display:grid; grid-template-columns:auto 1fr auto; gap:32px; align-items:center;
    }
    .bmc-score-circle {
      width:130px; height:130px; border-radius:50%;
      display:flex; flex-direction:column; align-items:center; justify-content:center; color:white;
    }
    .bmc-score-circle__value { font-size:42px; font-weight:800; line-height:1; }
    .bmc-score-circle__unit { font-size:13px; font-weight:400; opacity:0.85; }
    .bmc-score-label { font-size:13px; color:var(--text-muted); margin-bottom:4px; }
    .bmc-maturity-checks { display:flex; flex-direction:column; gap:6px; }
    .bmc-maturity-check { font-size:13px; display:flex; align-items:center; gap:6px; }

    /* ─── SECTION CARDS ─── */
    .bmc-card {
      background:white; border-radius:16px; padding:32px;
      margin:24px 0; border:1px solid var(--border);
    }
    .bmc-section-title {
      font-size:20px; font-weight:700; color:var(--primary);
      display:flex; align-items:center; gap:10px; margin-bottom:20px;
    }

    /* ─── CANVAS GRID ─── */
    .bmc-canvas-grid {
      display:grid;
      grid-template-columns: repeat(5, 1fr);
      grid-template-rows: auto auto auto;
      gap:0; border:2px solid #2d6a4f; border-radius:12px; overflow:hidden;
    }
    .bmc-canvas-cell {
      padding:16px; border:1px solid #e2e8f0; min-height:140px;
      position:relative;
    }
    .bmc-canvas-cell__header {
      font-size:10px; font-weight:700; text-transform:uppercase;
      letter-spacing:0.5px; color:white; padding:4px 10px;
      border-radius:4px; display:inline-block; margin-bottom:10px;
    }
    .bmc-canvas-cell__bullet {
      font-size:11px; color:var(--text-dark); margin-bottom:5px; line-height:1.4;
      padding-left:12px; position:relative;
    }
    .bmc-canvas-cell__bullet::before {
      content:'›'; position:absolute; left:0; color:var(--primary); font-weight:700;
    }
    .bmc-canvas-cell__subtitle {
      font-size:10px; font-weight:600; color:var(--text-light);
      text-transform:uppercase; letter-spacing:0.3px; margin:8px 0 4px;
    }

    /* ─── DIAGNOSTIC EXPERT ─── */
    .bmc-diag-grid { display:grid; gap:12px; }
    .bmc-diag-row {
      display:grid; grid-template-columns:1fr 60px auto;
      align-items:center; gap:12px; padding:12px 16px;
      border-radius:10px; background:#fafbfc; border:1px solid rgba(0,0,0,0.05);
    }
    .bmc-diag-row__label { font-size:14px; font-weight:600; }
    .bmc-diag-row__score { font-size:16px; font-weight:800; text-align:center; }
    .bmc-diag-row__comment { font-size:12px; color:var(--text-light); }
    .bmc-diag-bar { height:6px; background:#e5e7eb; border-radius:3px; overflow:hidden; margin-top:4px; }
    .bmc-diag-bar__fill { height:100%; border-radius:3px; }

    /* ─── FORCES & VIGILANCES ─── */
    .bmc-forces-grid { display:grid; grid-template-columns:1fr 1fr; gap:24px; }
    .bmc-force-card {
      border-radius:12px; padding:20px; border-left:4px solid;
    }
    .bmc-force-card__title { font-size:15px; font-weight:700; margin-bottom:8px; }
    .bmc-force-card__text { font-size:13px; line-height:1.6; }
    .bmc-force-card__action { font-size:12px; font-weight:600; margin-top:8px; display:flex; align-items:center; gap:4px; }

    /* ─── SWOT ─── */
    .bmc-swot-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
    .bmc-swot-cell { border-radius:12px; padding:20px; min-height:160px; }
    .bmc-swot-cell__title { font-size:14px; font-weight:700; margin-bottom:12px; }
    .bmc-swot-item { font-size:12px; margin-bottom:5px; line-height:1.5; }

    /* ─── RECOMMENDATIONS ─── */
    .bmc-reco-card {
      border-radius:12px; padding:20px; margin-bottom:16px;
      border-left:4px solid; background:#fafbfc;
    }
    .bmc-reco-card__horizon { font-size:14px; font-weight:700; margin-bottom:10px; display:flex; align-items:center; gap:8px; }
    .bmc-reco-card__item { font-size:13px; color:var(--text-dark); margin-bottom:6px; padding-left:16px; position:relative; line-height:1.5; }
    .bmc-reco-card__item::before { content:'→'; position:absolute; left:0; font-weight:700; color:var(--primary); }

    /* ─── FOOTER ─── */
    .bmc-footer {
      background:linear-gradient(135deg, #1a2e28 0%, #2d6a4f 40%, #40916c 100%);
      border-radius:16px; padding:40px; margin:24px 0 48px;
      color:white; text-align:center;
    }
    .bmc-footer__title { font-size:22px; font-weight:800; margin-bottom:4px; }
    .bmc-footer__company { font-size:16px; font-weight:500; opacity:0.9; }
    .bmc-footer__meta { font-size:12px; opacity:0.6; margin-top:8px; }
    .bmc-footer__quote { font-style:italic; font-size:13px; opacity:0.7; margin-top:16px; }

    /* ─── Print ─── */
    @media print {
      body { background:white; }
      .bmc-header { page-break-after:avoid; }
      .bmc-score-hero { box-shadow:none; border:1px solid #e5e7eb; }
      .bmc-card { page-break-inside:avoid; }
    }
    @media (max-width:768px) {
      .bmc-score-hero { grid-template-columns:1fr; text-align:center; }
      .bmc-canvas-grid { grid-template-columns:1fr 1fr; }
      .bmc-forces-grid { grid-template-columns:1fr; }
      .bmc-swot-grid { grid-template-columns:1fr; }
    }
  </style>
</head>
<body>
  <!-- ═══ 1. HEADER ═══ -->
  <div class="bmc-header">
    <div class="bmc-container bmc-header__inner">
      <div class="bmc-header__icon">📋</div>
      <div class="bmc-header__title">BUSINESS MODEL CANVAS</div>
      <div class="bmc-header__company">${companyName}</div>
      <div class="bmc-header__meta">
        ${[sector, brandName ? 'Marque ' + brandName : '', locationStr].filter(Boolean).join(' — ')}
      </div>
      <div class="bmc-header__tags">
        <span class="bmc-header__tag">${sectorStr}</span>
        <span class="bmc-header__tag">Analyse — ${dateStr}</span>
        ${tagline ? `<span class="bmc-header__tag">${tagline}</span>` : ''}
      </div>
    </div>
  </div>

  <div class="bmc-container">
    <!-- ═══ 2. SCORE HERO ═══ -->
    <div class="bmc-score-hero">
      <div>
        <div class="bmc-score-circle" style="background:${scoreColor};">
          <span class="bmc-score-circle__value">${analysis.globalScore}%</span>
          <span class="bmc-score-circle__unit">Score BMC Global</span>
        </div>
      </div>
      <div>
        <div class="bmc-score-label">Maturité du business model</div>
        <div class="bmc-maturity-checks">
          ${analysis.maturityChecks.map(ch => {
            const icon = ch.status === 'ok' ? '✓' : ch.status === 'warning' ? '⚠' : '→'
            const color = ch.status === 'ok' ? COLORS.primary : ch.status === 'warning' ? COLORS.orange : COLORS.accent
            return `<div class="bmc-maturity-check">
              <span style="color:${color};font-weight:700;">${icon}</span>
              <span style="color:${color};">${ch.label}</span>
            </div>`
          }).join('')}
        </div>
      </div>
      <div style="text-align:right;">
        ${analysis.caMensuel !== '—' ? `<div style="font-size:12px;color:var(--text-muted);">CA mensuel</div><div style="font-size:18px;font-weight:700;color:var(--primary);">≈ ${analysis.caMensuel}</div>` : ''}
        ${analysis.margeBrute !== '—' ? `<div style="font-size:12px;color:var(--text-muted);margin-top:8px;">Marge brute</div><div style="font-size:18px;font-weight:700;color:var(--accent);">≈ ${analysis.margeBrute}</div>` : ''}
      </div>
    </div>

    <!-- ═══ 3. CANVAS — VUE D'ENSEMBLE ═══ -->
    <div class="bmc-card">
      <div class="bmc-section-title">🗂️ CANVAS — VUE D'ENSEMBLE</div>
      <div class="bmc-canvas-grid">
        ${CANVAS_LAYOUT.map(cell => {
          const sec = BMC_SECTIONS[cell.qId]
          const answer = answers.get(cell.qId) ?? ''
          const bullets = extractBullets(answer)
          const headerColor = cell.qId === 2 ? COLORS.primary :
            [7, 6].includes(cell.qId) ? COLORS.accent :
            [4, 3].includes(cell.qId) ? '#7c3aed' :
            cell.qId === 8 ? '#0891b2' :
            cell.qId === 1 ? '#be185d' :
            cell.qId === 9 ? COLORS.orange : COLORS.red
          const isBottom = cell.qId === 9 || cell.qId === 5
          return `<div class="bmc-canvas-cell" style="grid-area:${cell.gridArea};">
            <div class="bmc-canvas-cell__header" style="background:${headerColor};">${sec.icon} ${sec.label.toUpperCase()}</div>
            ${isBottom && cell.qId === 9 && analysis.coutTotal !== '—' ? `<div style="font-size:11px;font-weight:700;color:var(--orange);margin-bottom:6px;">TOTAL ≈ ${analysis.coutTotal}</div>` : ''}
            ${isBottom && cell.qId === 5 && analysis.caMensuel !== '—' ? `<div style="font-size:11px;font-weight:700;color:var(--primary);margin-bottom:6px;">CA mensuel ≈ ${analysis.caMensuel}${analysis.margeBrute !== '—' ? ' · Marge ≈ ' + analysis.margeBrute : ''}</div>` : ''}
            ${bullets.length > 0
              ? bullets.slice(0, 5).map(b => `<div class="bmc-canvas-cell__bullet">${b}</div>`).join('')
              : '<div style="font-size:11px;color:#999;font-style:italic;">Non renseigné</div>'}
          </div>`
        }).join('')}
      </div>
    </div>

    <!-- ═══ 4. DIAGNOSTIC EXPERT — Scores par bloc ═══ -->
    <div class="bmc-card">
      <div class="bmc-section-title">📊 DIAGNOSTIC EXPERT</div>
      <div style="font-size:14px;font-weight:600;color:var(--text-dark);margin-bottom:16px;">
        Score global : <span style="color:${scoreColor};font-size:18px;font-weight:800;">${analysis.globalScore}%</span>
      </div>
      <div class="bmc-diag-grid">
        ${analysis.blocScores.map(bloc => {
          const barColor = bloc.score >= 80 ? COLORS.primary : bloc.score >= 60 ? COLORS.accent : bloc.score >= 40 ? COLORS.orange : COLORS.red
          return `<div class="bmc-diag-row">
            <div>
              <div class="bmc-diag-row__label">${bloc.label}</div>
              <div class="bmc-diag-bar"><div class="bmc-diag-bar__fill" style="width:${bloc.score}%;background:${barColor};"></div></div>
            </div>
            <div class="bmc-diag-row__score" style="color:${barColor};">${bloc.score}%</div>
            <div class="bmc-diag-row__comment">${bloc.comment}</div>
          </div>`
        }).join('')}
      </div>
    </div>

    <!-- ═══ 5. FORCES ═══ -->
    <div class="bmc-card">
      <div class="bmc-section-title">💪 Forces — ${analysis.forces.length} atouts majeurs</div>
      <div style="display:grid;gap:16px;">
        ${analysis.forces.map(f =>
          `<div class="bmc-force-card" style="border-color:${COLORS.primary};background:${COLORS.primaryBg};">
            <div class="bmc-force-card__title" style="color:${COLORS.primary};">✓ ${f.title}</div>
            <div class="bmc-force-card__text" style="color:#14532d;">${f.description}</div>
          </div>`
        ).join('')}
      </div>
    </div>

    <!-- ═══ 6. POINTS DE VIGILANCE ═══ -->
    <div class="bmc-card">
      <div class="bmc-section-title">⚠️ Points de vigilance — ${analysis.vigilances.length} risques identifiés</div>
      <div style="display:grid;gap:16px;">
        ${analysis.vigilances.map(v =>
          `<div class="bmc-force-card" style="border-color:${COLORS.orange};background:${COLORS.orangeLight};">
            <div class="bmc-force-card__title" style="color:${COLORS.orange};">⚠ ${v.title}</div>
            <div class="bmc-force-card__text" style="color:#7c2d12;">${v.description}</div>
            <div class="bmc-force-card__action" style="color:${COLORS.primary};">→ ${v.action}</div>
          </div>`
        ).join('')}
      </div>
    </div>

    <!-- ═══ 7. MATRICE SWOT SYNTHÉTIQUE ═══ -->
    <div class="bmc-card">
      <div class="bmc-section-title">📋 Matrice SWOT Synthétique</div>
      <div class="bmc-swot-grid">
        <div class="bmc-swot-cell" style="background:#dcfce7;border:1px solid #86efac;">
          <div class="bmc-swot-cell__title" style="color:#166534;">💪 FORCES</div>
          ${analysis.swot.forces.map(f => `<div class="bmc-swot-item" style="color:#14532d;">${f}</div>`).join('')}
        </div>
        <div class="bmc-swot-cell" style="background:#fee2e2;border:1px solid #fca5a5;">
          <div class="bmc-swot-cell__title" style="color:#991b1b;">⚡ FAIBLESSES</div>
          ${analysis.swot.faiblesses.map(f => `<div class="bmc-swot-item" style="color:#7f1d1d;">${f}</div>`).join('')}
        </div>
        <div class="bmc-swot-cell" style="background:#dbeafe;border:1px solid #93c5fd;">
          <div class="bmc-swot-cell__title" style="color:#1e40af;">🚀 OPPORTUNITÉS</div>
          ${analysis.swot.opportunites.map(f => `<div class="bmc-swot-item" style="color:#1e3a5f;">${f}</div>`).join('')}
        </div>
        <div class="bmc-swot-cell" style="background:#fff7ed;border:1px solid #fdba74;">
          <div class="bmc-swot-cell__title" style="color:#9a3412;">⛔ MENACES</div>
          ${analysis.swot.menaces.map(f => `<div class="bmc-swot-item" style="color:#7c2d12;">${f}</div>`).join('')}
        </div>
      </div>
    </div>

    <!-- ═══ 8. RECOMMANDATIONS STRATÉGIQUES ═══ -->
    <div class="bmc-card">
      <div class="bmc-section-title">🎯 Recommandations stratégiques — Plan d'action</div>
      ${analysis.recommendations.map((rec, idx) => {
        const colors = [
          { border: COLORS.primary, bg: COLORS.primaryBg, icon: '🏗️' },
          { border: COLORS.accent, bg: COLORS.accentLight, icon: '📈' },
          { border: '#7c3aed', bg: '#f5f3ff', icon: '🏭' },
        ]
        const style = colors[idx] ?? colors[0]
        return `<div class="bmc-reco-card" style="border-color:${style.border};background:${style.bg};">
          <div class="bmc-reco-card__horizon" style="color:${style.border};">${style.icon} ${rec.horizonLabel}</div>
          ${rec.items.map(item => `<div class="bmc-reco-card__item">${item}</div>`).join('')}
        </div>`
      }).join('')}
    </div>

    <!-- ═══ 9. PROPOSITION DE VALEUR DÉTAILLÉE ═══ -->
    ${answers.get(2) ? `
    <div class="bmc-card">
      <div class="bmc-section-title">💎 Proposition de Valeur — Détail</div>
      <div style="padding:20px;border-radius:12px;background:linear-gradient(135deg,${COLORS.primaryBg},#f0fdf4);border:1px solid ${COLORS.primaryLight};">
        <div style="font-size:16px;color:var(--primary);font-weight:700;margin-bottom:12px;font-style:italic;">
          "${analysis.propositionDeValeur || extractBullets(answers.get(2)!)[0] || ''}"
        </div>
        <div style="display:grid;gap:8px;">
          ${extractBullets(answers.get(2)!).slice(0, 5).map(b =>
            `<div style="display:flex;align-items:flex-start;gap:8px;font-size:13px;color:var(--text-dark);">
              <span style="color:${COLORS.primary};font-weight:700;">›</span> ${b}
            </div>`
          ).join('')}
        </div>
      </div>
    </div>
    ` : ''}

    <!-- ═══ FOOTER ═══ -->
    <div class="bmc-footer">
      <div class="bmc-footer__title">BUSINESS MODEL CANVAS</div>
      <div class="bmc-footer__company">${companyName}</div>
      <div class="bmc-footer__meta">
        ${[sector, brandName ? 'Marque ' + brandName : '', locationStr].filter(Boolean).join(' — ')}
      </div>
      <div class="bmc-footer__meta">Document généré le ${dateStr} • Analyse basée sur les données fournies et expertise sectorielle</div>
      <div class="bmc-footer__quote">"Les chiffres ne servent pas à juger le passé, mais à décider le futur."</div>
    </div>
  </div>

  <div style="text-align:center;padding:16px;color:#94a3b8;font-size:11px;">
    Généré par ESONO Investment Readiness · Module 1 BMC · ${dateStr}
  </div>
</body>
</html>`
}

// ═══════════════════════════════════════════════════════════════
// Diagnostic Résumé (lighter version)
// ═══════════════════════════════════════════════════════════════
export function generateBmcDiagnosticHtml(data: BmcDeliverableData): string {
  const { companyName, entrepreneurName, answers } = data
  const analysis = analyzeBmc(answers)
  const dateStr = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  const scoreColor = analysis.globalScore >= 80 ? '#059669' : analysis.globalScore >= 60 ? '#0284c7' : analysis.globalScore >= 40 ? '#d97706' : '#dc2626'

  const blocRows = analysis.blocScores.map(b => {
    const barColor = b.score >= 80 ? '#059669' : b.score >= 60 ? '#0284c7' : b.score >= 40 ? '#d97706' : '#dc2626'
    return `<div style="padding:10px;border-radius:8px;border:1px solid rgba(0,0,0,0.06);margin-bottom:6px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
        <span style="font-weight:600;font-size:13px;">${b.label}</span>
        <span style="font-weight:700;color:${barColor};font-size:14px;">${b.score}%</span>
      </div>
      <div style="height:5px;background:#e5e7eb;border-radius:3px;overflow:hidden;margin-bottom:4px;">
        <div style="height:100%;width:${b.score}%;background:${barColor};border-radius:3px;"></div>
      </div>
      <div style="font-size:11px;color:#666;">${b.comment}</div>
    </div>`
  }).join('')

  const forcesList = analysis.forces.map(f => `<li style="margin-bottom:6px;font-size:13px;"><strong style="color:#059669;">✓ ${f.title}</strong> — ${f.description}</li>`).join('')
  const vigilancesList = analysis.vigilances.map(v => `<li style="margin-bottom:6px;font-size:13px;"><strong style="color:#d97706;">⚠ ${v.title}</strong> — ${v.description} <em style="color:#0284c7;">→ ${v.action}</em></li>`).join('')

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Diagnostic BMC - ${companyName}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Inter','IBM Plex Sans',system-ui,sans-serif; background:#f8fafc; color:#1e293b; line-height:1.6; }
    .container { max-width:900px; margin:0 auto; padding:32px 24px; }
    .header { text-align:center; margin-bottom:32px; }
    .header h1 { font-size:28px; color:#2d6a4f; margin-bottom:8px; }
    .header p { color:#64748b; font-size:14px; }
    .card { background:white; border-radius:12px; padding:24px; margin-bottom:20px; box-shadow:0 1px 3px rgba(0,0,0,0.08); }
    .card h2 { font-size:18px; color:#2d6a4f; margin-bottom:16px; }
    @media print { body { background:white; } .card { box-shadow:none; border:1px solid #e5e7eb; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📋 Diagnostic Business Model Canvas</h1>
      <p>${entrepreneurName} · ${companyName} · ${dateStr}</p>
    </div>

    <div class="card">
      <div style="display:flex;align-items:center;gap:24px;">
        <div style="width:110px;height:110px;border-radius:50%;background:${scoreColor};display:flex;flex-direction:column;align-items:center;justify-content:center;color:white;">
          <span style="font-size:32px;font-weight:800;">${analysis.globalScore}%</span>
          <span style="font-size:11px;opacity:0.8;">Score BMC</span>
        </div>
        <div style="flex:1;">
          <h2 style="margin-bottom:8px;">Score Global BMC</h2>
          <p style="font-size:14px;color:#64748b;">${analysis.globalScore >= 80 ? 'Excellent business model, bien structuré et documenté.' : analysis.globalScore >= 60 ? 'Bon business model avec des axes d\'amélioration identifiés.' : analysis.globalScore >= 40 ? 'Business model à renforcer — plusieurs blocs nécessitent plus de détails.' : 'Business model insuffisamment documenté. Reprenez les fondamentaux.'}</p>
        </div>
      </div>
    </div>

    <div class="card">
      <h2>📊 Scores par Bloc BMC</h2>
      ${blocRows}
    </div>

    <div class="card">
      <h2>💪 Forces (${analysis.forces.length})</h2>
      <ul style="padding-left:20px;">${forcesList}</ul>
    </div>

    <div class="card">
      <h2>⚠️ Points de Vigilance (${analysis.vigilances.length})</h2>
      <ul style="padding-left:20px;">${vigilancesList}</ul>
    </div>

    <div style="text-align:center;padding:24px;color:#94a3b8;font-size:12px;">
      Généré par ESONO Investment Readiness · Module 1 BMC · ${new Date().toISOString().slice(0, 10)}
    </div>
  </div>
</body>
</html>`
}
