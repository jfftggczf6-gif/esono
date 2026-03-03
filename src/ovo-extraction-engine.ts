// ═══════════════════════════════════════════════════════════════
// OVO Extraction Engine — Claude AI extraction for Plan Financier OVO
// Step C: Call Claude to extract structured financial data from deliverables
//
// ARCHITECTURE v2 (2026-03):
// - Données réelles de l'entrepreneur (framework_pme_data) = INTOUCHABLES
// - Objectifs CA de l'entrepreneur = ses projections, respectées
// - Claude ne comble QUE les trous (détail produit, estimations N-2/N-1)
// - Chaque valeur porte une source: declared | entrepreneur_target | ai_estimate
// ═══════════════════════════════════════════════════════════════

import { callClaudeJSON } from './claude-api'
import { FiscalParams } from './fiscal-params'
import { getTemplateStructureSummary } from './ovo-template-structure'

// ═══════════════════════════════════════════════════════════════
// TypeScript interfaces matching the JSON schema Claude must return
// ═══════════════════════════════════════════════════════════════

export interface OVOExtractionResult {
  hypotheses: {
    company_name: string
    country: string
    currency: string
    exchange_rate_eur: number
    vat_rate: number
    inflation_rate: number
    corporate_tax_rate: number
    tax_regime_1: { name: string; description: string; rate: number }
    tax_regime_2: { name: string; description: string; rate: number }
    social_charges_rate: number
    base_year: number
    growth_rate_annual: number
    sector: string
    business_model: string
  }
  produits: Array<{
    numero: number           // 1-20
    nom: string
    description: string
    actif: boolean           // filter = 1 or 0
    type: 'product' | 'service'
    gamme: 1 | 2 | 3        // Range: 1=Low, 2=Medium, 3=High
    canal: 1 | 2            // Channel: 1=B2B, 2=B2C
    prix_unitaire: {         // Par annee
      [year: string]: number // YEAR-2, YEAR-1, CURRENT_YEAR, YEAR2, YEAR3, YEAR4, YEAR5
    }
    volume: {
      [year: string]: number
    }
    cout_unitaire: {
      [year: string]: number
    }
  }>
  personnel: Array<{
    categorie: string        // ex: INTERIMAIRES, EMPLOYE(E)S
    departement: string      // ex: VENTE & MARKETING, ADMINISTRATION
    charges_sociales_pct: number  // ex: 0.1645
    effectif: {              // Nombre de personnes par annee
      [year: string]: number
    }
    salaire_brut_mensuel: {  // Salaire brut mensuel par personne
      [year: string]: number
    }
  }>
  compte_resultat: {
    marketing: {
      items: Array<{
        nom: string          // ex: ADVERTISING, COMMISSIONS, etc.
        montants: { [year: string]: number }
      }>
    }
    frais_bureau: {
      items: Array<{
        nom: string          // ex: RENT, ELECTRICITY, INTERNET, etc.
        montants: { [year: string]: number }
      }>
    }
    autres_depenses: {
      items: Array<{
        nom: string
        montants: { [year: string]: number }
      }>
    }
    voyage_transport: {
      montant_annuel: { [year: string]: number }
    }
    assurances: {
      items: Array<{
        nom: string
        montants: { [year: string]: number }
      }>
    }
    entretien: {
      items: Array<{
        nom: string
        montants: { [year: string]: number }
      }>
    }
    tiers: {
      items: Array<{
        nom: string
        montants: { [year: string]: number }
      }>
    }
  }
  investissements: Array<{
    nom: string
    categorie: 'FIXED ASSETS' | 'INTANGIBLE ASSETS' | 'START-UP COSTS'
    annee_acquisition: number
    valeur_acquisition: number
    taux_amortissement: number  // % annuel
  }>
  financement: {
    capital_initial: number
    apport_nouveaux_actionnaires: { [year: string]: number }
    pret_ovo: { montant: number; taux: number; duree: number }
    pret_famille: { montant: number; taux: number; duree: number }
    pret_banque: { montant: number; taux: number; duree: number }
  }
  tresorerie_mensuelle: {
    position_initiale: number
    delai_paiement_clients_jours: number
    delai_paiement_fournisseurs_jours: number
  }
  scenarios_simulation: {
    worst: { revenue_products: number; cogs_products: number; revenue_services: number; cogs_services: number; marketing: number; salaries: number; taxes_staff: number; office: number; other: number; travel: number; insurance: number; maintenance: number; third_parties: number }
    typical: { revenue_products: number; cogs_products: number; revenue_services: number; cogs_services: number; marketing: number; salaries: number; taxes_staff: number; office: number; other: number; travel: number; insurance: number; maintenance: number; third_parties: number }
    best: { revenue_products: number; cogs_products: number; revenue_services: number; cogs_services: number; marketing: number; salaries: number; taxes_staff: number; office: number; other: number; travel: number; insurance: number; maintenance: number; third_parties: number }
  }
  gammes: {
    range1: { nom: string; description: string }
    range2: { nom: string; description: string }
    range3: { nom: string; description: string }
  }
  canaux: {
    channel1: { nom: string; description: string }
    channel2: { nom: string; description: string }
  }
  metadata: {
    extraction_date: string
    sources_used: string[]
    confidence_score: number      // 0-100
    missing_data_notes: string[]
    cascade_applied: string[]     // Which cascade rules were used
    data_sources?: {              // Traçabilité par champ
      ca_current_year?: 'declared' | 'entrepreneur_target' | 'ai_estimate'
      ca_year_minus_2?: 'declared' | 'entrepreneur_target' | 'ai_estimate'
      ca_year_minus_1?: 'declared' | 'entrepreneur_target' | 'ai_estimate'
      ca_projections?: 'declared' | 'entrepreneur_target' | 'ai_estimate'
      charges?: 'declared' | 'entrepreneur_target' | 'ai_estimate'
      investissements?: 'declared' | 'entrepreneur_target' | 'ai_estimate'
      personnel?: 'declared' | 'entrepreneur_target' | 'ai_estimate'
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// PME Structured Data — données réelles de l'entrepreneur
// Passées directement sans passer par le texte libre du Framework
// ═══════════════════════════════════════════════════════════════

export interface PmeStructuredData {
  companyName: string
  sector: string
  country: string
  activities: { name: string; isStrategic: boolean }[]
  historique: {
    caTotal: [number, number, number]        // N-2, N-1, N
    caByActivity: [number, number, number][] // per activity
    achatsMP: [number, number, number]
    sousTraitance: [number, number, number]
    coutsProduction: [number, number, number]
    salaires: [number, number, number]
    loyers: [number, number, number]
    assurances: [number, number, number]
    fraisGeneraux: [number, number, number]
    marketing: [number, number, number]
    fraisBancaires: [number, number, number]
    resultatNet: [number, number, number]
    tresoDebut: [number, number, number]
    tresoFin: [number, number, number]
    dso: [number, number, number]
    dpo: [number, number, number]
    stockJours: [number, number, number]
    detteCT: [number, number, number]
    detteLT: [number, number, number]
    serviceDette: [number, number, number]
    amortissements: [number, number, number]
  }
  hypotheses: {
    croissanceCA: [number, number, number, number, number]
    caObjectifs?: [number, number, number, number, number]
    evolutionPrix: [number, number, number, number, number]
    evolutionCoutsDirects: [number, number, number, number, number]
    inflationChargesFixes: [number, number, number, number, number]
    evolutionMasseSalariale: [number, number, number, number, number]
    capex: [number, number, number, number, number]
    amortissement: number
    embauches?: { poste: string; annee: number; salaireMensuel: number }[]
    investissements?: { description: string; montants: [number, number, number, number, number] }[]
  }
}

// ═══════════════════════════════════════════════════════════════
// System prompt for Claude — Financial data extraction
// ═══════════════════════════════════════════════════════════════

function buildOVOSystemPrompt(
  kbContext: string,
  templateStructure: string,
  fiscal: FiscalParams
): string {
  return `Tu es un expert financier specialise dans le remplissage de plans financiers pour les PME africaines, format bailleurs (OVO — Overseas Volunteer Organisation).

TON ROLE: Structurer les donnees financieres pour remplir le template Excel OVO.
Tu recois deux types de sources:
  1. DONNEES STRUCTUREES PME (Module 3) = chiffres reels declares par l'entrepreneur → PRIORITE ABSOLUE
  2. LIVRABLES D'ANALYSE (Framework texte, BMC, SIC, Diagnostic) = contexte qualitatif seulement

${templateStructure}

${kbContext}

=== REGLES STRICTES — HIERARCHIE DES DONNEES ===

1. DONNEES DECLAREES (historique.caTotal, salaires, charges, investissements) : INTOUCHABLES
   → Si une valeur est > 0, tu DOIS l'utiliser telle quelle, sans la modifier
   → CA reel de l'annee en cours = chiffre declare, meme s'il differe des projections Framework

2. OBJECTIFS ENTREPRENEUR (hypotheses.caObjectifs) : ce sont SES projections pour Y1-Y5
   → Utiliser ces chiffres pour les annees futures, pas les projections du Framework texte
   → Si caObjectifs est fourni, il PRIME sur croissanceCA

3. ESTIMATION IA : uniquement pour les trous (donnee = 0 ou absente)
   → Annees N-2, N-1 si caTotal[0]=0 ou caTotal[1]=0 : tu peux estimer
   → Detail produit par produit (prix x volume) si non disponible
   → Repartition des charges par poste si non detaillee

4. FEUILLES PROTEGEES: Ne JAMAIS modifier ReadMe, Instructions, RevenuePivot, RevenueChart, FinancePivot, FinanceChart, FinanceEUR
5. FORMULES: Ne JAMAIS ecraser une cellule qui contient une formule
6. ANNEES: Utiliser les cles: "YEAR_MINUS_2", "YEAR_MINUS_1", "CURRENT_YEAR", "YEAR2", "YEAR3", "YEAR4", "YEAR5"

=== CASCADE — UNIQUEMENT QUAND DONNEE = 0 OU ABSENTE ===
1. Donnee declaree (si > 0) → UTILISER DIRECTEMENT
2. Objectif entrepreneur (caObjectifs) → UTILISER DIRECTEMENT
3. Calculer a partir des ratios declares (marge brute %, etc.)
4. Estimer par IA du secteur/pays: ${fiscal.country}
5. Valeurs par defaut pays + inflation ${(fiscal.inflationRate * 100).toFixed(1)}%

=== CONTRAINTE CRITIQUE ===
Le CA de CURRENT_YEAR dans ton JSON DOIT correspondre au CA reel declare.
Exemple: si caTotal[2] = 59 130 000, alors la somme prix*volume de CURRENT_YEAR pour tous les produits DOIT donner ~59 130 000.
Ne JAMAIS substituer une projection Framework (ex: 156M) au CA reel (ex: 59M).

=== TRACABILITE ===
Dans metadata.data_sources, indique pour chaque bloc la source utilisee:
- "declared" = donnee reelle de l'entrepreneur (valeur > 0 dans les inputs)
- "entrepreneur_target" = objectif/projection de l'entrepreneur (caObjectifs)
- "ai_estimate" = estimation IA (donnee absente ou = 0)

=== FORMAT DE REPONSE ===
Repondre UNIQUEMENT en JSON valide, sans commentaires, sans markdown. Le JSON doit correspondre exactement au schema suivant:

{
  "hypotheses": {
    "company_name": "string — nom de l'entreprise",
    "country": "string — pays (ex: COTE D'IVOIRE)",
    "currency": "string — monnaie (ex: CFA)",
    "exchange_rate_eur": "number — taux de change (ex: 655.957)",
    "vat_rate": "number — TVA decimal (ex: 0.18)",
    "inflation_rate": "number — inflation decimal (ex: 0.035)",
    "corporate_tax_rate": "number — impot societes (ex: 0.25)",
    "tax_regime_1": { "name": "string", "description": "string", "rate": "number" },
    "tax_regime_2": { "name": "string", "description": "string", "rate": "number" },
    "social_charges_rate": "number — charges sociales (ex: 0.1645)",
    "base_year": "number — annee de base (ex: 2025)",
    "growth_rate_annual": "number — taux croissance annuel estime (ex: 0.15)",
    "sector": "string — secteur d'activite",
    "business_model": "string — modele economique"
  },
  "produits": [
    {
      "numero": 1,
      "nom": "string — nom du produit",
      "description": "string",
      "actif": true,
      "type": "product | service",
      "gamme": "1 | 2 | 3",
      "canal": "1 | 2",
      "prix_unitaire": { "YEAR_MINUS_2": 0, "YEAR_MINUS_1": 0, "CURRENT_YEAR": 0, "YEAR2": 0, "YEAR3": 0, "YEAR4": 0, "YEAR5": 0 },
      "volume": { "YEAR_MINUS_2": 0, "YEAR_MINUS_1": 0, "CURRENT_YEAR": 0, "YEAR2": 0, "YEAR3": 0, "YEAR4": 0, "YEAR5": 0 },
      "cout_unitaire": { "YEAR_MINUS_2": 0, "YEAR_MINUS_1": 0, "CURRENT_YEAR": 0, "YEAR2": 0, "YEAR3": 0, "YEAR4": 0, "YEAR5": 0 }
    }
  ],
  "personnel": [
    {
      "categorie": "string",
      "departement": "string",
      "charges_sociales_pct": 0.1645,
      "effectif": { "YEAR_MINUS_2": 0, "YEAR_MINUS_1": 0, "CURRENT_YEAR": 0, "YEAR2": 0, "YEAR3": 0, "YEAR4": 0, "YEAR5": 0 },
      "salaire_brut_mensuel": { "YEAR_MINUS_2": 0, "YEAR_MINUS_1": 0, "CURRENT_YEAR": 0, "YEAR2": 0, "YEAR3": 0, "YEAR4": 0, "YEAR5": 0 }
    }
  ],
  "compte_resultat": {
    "marketing": { "items": [{ "nom": "string", "montants": {} }] },
    "frais_bureau": { "items": [{ "nom": "string", "montants": {} }] },
    "autres_depenses": { "items": [{ "nom": "string", "montants": {} }] },
    "voyage_transport": { "montant_annuel": {} },
    "assurances": { "items": [{ "nom": "string", "montants": {} }] },
    "entretien": { "items": [{ "nom": "string", "montants": {} }] },
    "tiers": { "items": [{ "nom": "string", "montants": {} }] }
  },
  "investissements": [
    {
      "nom": "string",
      "categorie": "FIXED ASSETS | INTANGIBLE ASSETS | START-UP COSTS",
      "annee_acquisition": 2025,
      "valeur_acquisition": 0,
      "taux_amortissement": 0.20
    }
  ],
  "financement": {
    "capital_initial": 0,
    "apport_nouveaux_actionnaires": {},
    "pret_ovo": { "montant": 0, "taux": ${fiscal.loanInterestOVO}, "duree": ${fiscal.loanPeriodOVO} },
    "pret_famille": { "montant": 0, "taux": ${fiscal.loanInterestFamily}, "duree": ${fiscal.loanPeriodFamily} },
    "pret_banque": { "montant": 0, "taux": ${fiscal.loanInterestBank}, "duree": ${fiscal.loanPeriodBank} }
  },
  "tresorerie_mensuelle": {
    "position_initiale": 0,
    "delai_paiement_clients_jours": 30,
    "delai_paiement_fournisseurs_jours": 60
  },
  "scenarios_simulation": {
    "worst": { "revenue_products": 0.95, "cogs_products": 1.10, "revenue_services": 0.60, "cogs_services": 1.10, "marketing": 1.25, "salaries": 1.25, "taxes_staff": 1.25, "office": 1.10, "other": 1.10, "travel": 1.10, "insurance": 1.10, "maintenance": 1.10, "third_parties": 1.20 },
    "typical": { "revenue_products": 1, "cogs_products": 1, "revenue_services": 1, "cogs_services": 1, "marketing": 1, "salaries": 1, "taxes_staff": 1, "office": 1, "other": 1, "travel": 1, "insurance": 1, "maintenance": 1, "third_parties": 1 },
    "best": { "revenue_products": 1.20, "cogs_products": 0.95, "revenue_services": 1.20, "cogs_services": 0.95, "marketing": 0.85, "salaries": 0.85, "taxes_staff": 0.85, "office": 0.90, "other": 0.90, "travel": 0.90, "insurance": 0.90, "maintenance": 0.90, "third_parties": 0.85 }
  },
  "gammes": {
    "range1": { "nom": "string", "description": "string" },
    "range2": { "nom": "string", "description": "string" },
    "range3": { "nom": "string", "description": "string" }
  },
  "canaux": {
    "channel1": { "nom": "string", "description": "string" },
    "channel2": { "nom": "string", "description": "string" }
  },
  "metadata": {
    "extraction_date": "ISO date string",
    "sources_used": ["framework", "bmc", "sic", "diagnostic"],
    "confidence_score": 75,
    "missing_data_notes": ["Liste des donnees manquantes ou estimees"],
    "cascade_applied": ["Liste des regles de cascade appliquees"]
  }
}

IMPORTANT:
- Tous les montants en monnaie locale (${fiscal.currency})
- Les taux sont en decimales (0.18 = 18%)
- Fournir des projections realistes basees sur les donnees disponibles
- Minimum 1 produit actif, maximum 20 produits + 10 services
- Maximum 10 categories de personnel
- Au moins 1 investissement
- Toujours remplir les 7 annees meme si estimation necessaire
- Le confidence_score reflete la qualite des donnees sources (0-100)
`
}

// ═══════════════════════════════════════════════════════════════
// Main extraction function
// ═══════════════════════════════════════════════════════════════

export interface DeliverableData {
  id: string
  type: string
  content: string
  score: number | null
  available: boolean
}

export interface OVOExtractionInput {
  apiKey: string
  framework: DeliverableData
  bmc?: DeliverableData
  sic?: DeliverableData
  diagnostic?: DeliverableData
  fiscal: FiscalParams
  kbContext: string
  pmeData?: PmeStructuredData | null  // Données structurées PME (Module 3) — PRIORITÉ ABSOLUE
}

/**
 * Call Claude to extract structured financial data for the OVO Plan
 * Step C of the generation pipeline
 * 
 * v2: pmeData (données structurées Module 3) is injected as PRIORITY source.
 * Claude only fills gaps (product breakdown, N-2/N-1 estimates if missing).
 */
export async function extractOVOData(input: OVOExtractionInput): Promise<OVOExtractionResult> {
  const { apiKey, framework, bmc, sic, diagnostic, fiscal, kbContext, pmeData } = input

  // Build the template structure summary
  const templateStructure = getTemplateStructureSummary()

  // Build the system prompt
  const systemPrompt = buildOVOSystemPrompt(kbContext, templateStructure, fiscal)

  // Build the user prompt with structured PME data + deliverables for context
  const userPrompt = buildUserPrompt(framework, bmc, sic, diagnostic, fiscal, pmeData)

  console.log(`[OVO Extraction] Calling Claude with ${userPrompt.length} chars user prompt`)
  console.log(`[OVO Extraction] Sources: pmeData=${!!pmeData}, framework=${framework.available}, bmc=${!!bmc?.available}, sic=${!!sic?.available}, diagnostic=${!!diagnostic?.available}`)
  if (pmeData) {
    console.log(`[OVO Extraction] PME declared CA: N-2=${pmeData.historique.caTotal[0]}, N-1=${pmeData.historique.caTotal[1]}, N=${pmeData.historique.caTotal[2]}`)
    if (pmeData.hypotheses.caObjectifs) {
      console.log(`[OVO Extraction] PME CA targets: ${pmeData.hypotheses.caObjectifs.join(', ')}`)
    }
  }

  const result = await callClaudeJSON<OVOExtractionResult>({
    apiKey,
    systemPrompt,
    userPrompt,
    maxTokens: 8000,
    timeoutMs: 120_000,
    maxRetries: 2,
    label: 'OVO Extraction'
  })

  // Validate, sanitize, and enforce PME declared data
  const sanitized = sanitizeExtractionResult(result, fiscal)
  
  // v2: Post-extraction enforcement — force declared data over Claude's output
  if (pmeData) {
    enforceDeclaratedData(sanitized, pmeData, fiscal)
  }
  
  return sanitized
}

/**
 * Build user prompt with structured PME data (priority) + deliverables (context)
 */
function buildUserPrompt(
  framework: DeliverableData,
  bmc?: DeliverableData,
  sic?: DeliverableData,
  diagnostic?: DeliverableData,
  fiscal?: FiscalParams,
  pmeData?: PmeStructuredData | null
): string {
  let prompt = `Structurer les donnees financieres pour le Plan Financier OVO.

`

  // ═══ SECTION 1: DONNÉES STRUCTURÉES PME — PRIORITÉ ABSOLUE ═══
  if (pmeData) {
    const h = pmeData.historique
    const hyp = pmeData.hypotheses
    const yearLabels = ['N-2', 'N-1', 'N (année en cours)']
    
    prompt += `=== DONNEES STRUCTUREES PME (Module 3) — PRIORITE ABSOLUE ===
Entreprise: ${pmeData.companyName}
Secteur: ${pmeData.sector}
Pays: ${pmeData.country}
Activites: ${pmeData.activities.map(a => `${a.name}${a.isStrategic ? ' (strategique)' : ''}`).join(', ')}

--- CHIFFRE D'AFFAIRES REEL (INTOUCHABLE si > 0) ---
`
    for (let i = 0; i < 3; i++) {
      const val = h.caTotal[i]
      const status = val > 0 ? 'DECLARE — NE PAS MODIFIER' : 'NON RENSEIGNE — A ESTIMER PAR IA'
      prompt += `${yearLabels[i]}: ${val > 0 ? val.toLocaleString('fr-FR') : '0'} CFA [${status}]\n`
    }

    // CA par activité
    if (h.caByActivity?.length > 0) {
      prompt += `\nCA par activite (annee N):\n`
      pmeData.activities.forEach((act, idx) => {
        const ca = h.caByActivity[idx]?.[2] || 0
        prompt += `  - ${act.name}: ${ca > 0 ? ca.toLocaleString('fr-FR') : '0'} CFA\n`
      })
    }

    prompt += `\n--- OBJECTIFS CA ENTREPRENEUR (Y1-Y5) — SES PROJECTIONS ---\n`
    if (hyp.caObjectifs && hyp.caObjectifs.some(v => v > 0)) {
      for (let i = 0; i < 5; i++) {
        prompt += `Y${i + 1}: ${hyp.caObjectifs[i]?.toLocaleString('fr-FR') || '0'} CFA [OBJECTIF ENTREPRENEUR]\n`
      }
    } else {
      prompt += `Pas d'objectifs absolus. Taux de croissance declares: ${hyp.croissanceCA.map(v => v + '%').join(', ')}\n`
    }

    prompt += `\n--- CHARGES REELLES DECLAREES (annee N — INTOUCHABLE si > 0) ---\n`
    const charges = [
      ['Achats MP/marchandises', h.achatsMP[2]],
      ['Sous-traitance', h.sousTraitance[2]],
      ['Couts production', h.coutsProduction[2]],
      ['Salaires', h.salaires[2]],
      ['Loyers', h.loyers[2]],
      ['Assurances', h.assurances[2]],
      ['Frais generaux', h.fraisGeneraux[2]],
      ['Marketing', h.marketing[2]],
      ['Frais bancaires', h.fraisBancaires[2]],
      ['Resultat net', h.resultatNet[2]],
    ] as [string, number][]
    for (const [label, val] of charges) {
      if (val !== 0) prompt += `  ${label}: ${val.toLocaleString('fr-FR')} CFA [DECLARE]\n`
      else prompt += `  ${label}: 0 [NON RENSEIGNE — estimer si pertinent]\n`
    }

    prompt += `\n--- TRESORERIE DECLAREE ---\n`
    prompt += `  Tresorerie debut N: ${h.tresoDebut[2]?.toLocaleString('fr-FR') || '0'} CFA\n`
    prompt += `  Tresorerie fin N: ${h.tresoFin[2]?.toLocaleString('fr-FR') || '0'} CFA\n`

    prompt += `\n--- BFR ---\n`
    prompt += `  DSO: ${h.dso[2]} jours | DPO: ${h.dpo[2]} jours | Stock: ${h.stockJours[2]} jours\n`

    prompt += `\n--- HYPOTHESES ENTREPRENEUR ---\n`
    prompt += `  Evolution prix: ${hyp.evolutionPrix.map(v => v + '%').join(', ')}\n`
    prompt += `  Evolution couts directs: ${hyp.evolutionCoutsDirects.map(v => v + '%').join(', ')}\n`
    prompt += `  Inflation charges fixes: ${hyp.inflationChargesFixes.map(v => v + '%').join(', ')}\n`
    prompt += `  Evolution masse salariale: ${hyp.evolutionMasseSalariale.map(v => v + '%').join(', ')}\n`
    prompt += `  CAPEX: ${hyp.capex.map(v => v.toLocaleString('fr-FR')).join(', ')} CFA\n`
    prompt += `  Duree amortissement: ${hyp.amortissement} ans\n`

    if (hyp.investissements?.length) {
      prompt += `\n--- INVESTISSEMENTS DETAILLES ---\n`
      for (const inv of hyp.investissements) {
        prompt += `  ${inv.description}: ${inv.montants.map(v => v.toLocaleString('fr-FR')).join(', ')} CFA\n`
      }
    }

    if (hyp.embauches?.length) {
      prompt += `\n--- PLAN D'EMBAUCHE ---\n`
      for (const emb of hyp.embauches) {
        prompt += `  ${emb.poste} (annee ${emb.annee}): ${emb.salaireMensuel.toLocaleString('fr-FR')} CFA/mois\n`
      }
    }

    prompt += `\n--- DETTES ---\n`
    prompt += `  Dette CT: ${h.detteCT[2]?.toLocaleString('fr-FR') || '0'} | Dette LT: ${h.detteLT[2]?.toLocaleString('fr-FR') || '0'}\n`
    prompt += `  Service dette annuel: ${h.serviceDette[2]?.toLocaleString('fr-FR') || '0'} CFA\n`
    prompt += `  Amortissements: ${h.amortissements[2]?.toLocaleString('fr-FR') || '0'} CFA\n`

    prompt += `\n`
  }

  // ═══ SECTION 2: LIVRABLES — CONTEXTE QUALITATIF UNIQUEMENT ═══
  prompt += `=== FRAMEWORK (texte d'analyse) — POUR CONTEXTE QUALITATIF SEULEMENT ===
⚠️ Les CHIFFRES du Framework sont des projections intermediaires. Si des donnees structurees PME existent ci-dessus, elles PRIMENT.
Score: ${framework.score || 'N/A'}
${framework.content}

`

  if (bmc?.available && bmc.content) {
    prompt += `=== BMC ANALYSE (Business Model Canvas) — CONTEXTE ===
Score: ${bmc.score || 'N/A'}
${bmc.content}

`
  }

  if (sic?.available && sic.content) {
    prompt += `=== SIC ANALYSE (Social Impact Canvas) — CONTEXTE ===
Score: ${sic.score || 'N/A'}
${sic.content}

`
  }

  if (diagnostic?.available && diagnostic.content) {
    prompt += `=== DIAGNOSTIC EXPERT — CONTEXTE ===
Score: ${diagnostic.score || 'N/A'}
${diagnostic.content}

`
  }

  // ═══ SECTION 3: INSTRUCTIONS FINALES ═══
  prompt += `=== INSTRUCTIONS FINALES ===
1. REGLE D'OR: si une donnee structuree PME existe et est > 0, l'utiliser EXACTEMENT — ne jamais la remplacer par une projection Framework
2. Pour CURRENT_YEAR: la somme des (prix_unitaire * volume) de tous les produits DOIT correspondre au CA reel declare (${pmeData?.historique?.caTotal?.[2]?.toLocaleString('fr-FR') || 'N/A'} CFA)
3. Pour Y1-Y5 (YEAR2-YEAR5): utiliser les objectifs CA de l'entrepreneur si fournis, sinon appliquer croissanceCA
4. Pour N-2, N-1: si CA declare = 0, estimer par retro-projection cohérente avec le CA de N
5. Decomposer le CA en produits (prix unitaire * volume) de maniere coherente avec les activites declarees
6. Les charges fixes des annees futures doivent evoluer selon les hypotheses de l'entrepreneur, pas les projections Framework
7. Montants en ${fiscal?.currency || 'CFA'}
8. Dans metadata.data_sources, indiquer la source de chaque bloc

Genere le JSON complet maintenant.`

  return prompt
}

/**
 * Sanitize and validate the extraction result
 * Ensures all required fields are present and values are reasonable
 */
function sanitizeExtractionResult(result: any, fiscal: FiscalParams): OVOExtractionResult {
  // Ensure hypotheses exist with defaults
  if (!result.hypotheses) result.hypotheses = {}
  const h = result.hypotheses
  h.country = h.country || fiscal.country
  h.currency = h.currency || fiscal.currency
  h.exchange_rate_eur = h.exchange_rate_eur || fiscal.exchangeRateEUR
  h.vat_rate = h.vat_rate ?? fiscal.vat
  h.inflation_rate = h.inflation_rate ?? fiscal.inflationRate
  h.corporate_tax_rate = h.corporate_tax_rate ?? fiscal.corporateTax
  h.social_charges_rate = h.social_charges_rate ?? fiscal.socialChargesRate
  h.base_year = h.base_year || new Date().getFullYear()
  h.growth_rate_annual = h.growth_rate_annual ?? 0.15

  if (!h.tax_regime_1) h.tax_regime_1 = fiscal.taxRegime1
  if (!h.tax_regime_2) h.tax_regime_2 = fiscal.taxRegime2

  // Ensure produits is an array with at least 1 entry
  if (!Array.isArray(result.produits) || result.produits.length === 0) {
    result.produits = [{
      numero: 1,
      nom: 'Produit Principal',
      description: 'Produit principal de l\'entreprise',
      actif: true,
      type: 'product',
      gamme: 1,
      canal: 1,
      prix_unitaire: { YEAR_MINUS_2: 0, YEAR_MINUS_1: 0, CURRENT_YEAR: 0, YEAR2: 0, YEAR3: 0, YEAR4: 0, YEAR5: 0 },
      volume: { YEAR_MINUS_2: 0, YEAR_MINUS_1: 0, CURRENT_YEAR: 0, YEAR2: 0, YEAR3: 0, YEAR4: 0, YEAR5: 0 },
      cout_unitaire: { YEAR_MINUS_2: 0, YEAR_MINUS_1: 0, CURRENT_YEAR: 0, YEAR2: 0, YEAR3: 0, YEAR4: 0, YEAR5: 0 }
    }]
  }

  // Ensure personnel exists
  if (!Array.isArray(result.personnel)) result.personnel = []

  // Ensure compte_resultat exists
  if (!result.compte_resultat) result.compte_resultat = {}
  const cr = result.compte_resultat
  if (!cr.marketing) cr.marketing = { items: [] }
  if (!cr.frais_bureau) cr.frais_bureau = { items: [] }
  if (!cr.autres_depenses) cr.autres_depenses = { items: [] }
  if (!cr.voyage_transport) cr.voyage_transport = { montant_annuel: {} }
  if (!cr.assurances) cr.assurances = { items: [] }
  if (!cr.entretien) cr.entretien = { items: [] }
  if (!cr.tiers) cr.tiers = { items: [] }

  // Ensure investissements exists
  if (!Array.isArray(result.investissements)) result.investissements = []

  // Ensure financement exists
  if (!result.financement) result.financement = {}
  const f = result.financement
  f.capital_initial = f.capital_initial ?? 0
  if (!f.pret_ovo) f.pret_ovo = { montant: 0, taux: fiscal.loanInterestOVO, duree: fiscal.loanPeriodOVO }
  if (!f.pret_famille) f.pret_famille = { montant: 0, taux: fiscal.loanInterestFamily, duree: fiscal.loanPeriodFamily }
  if (!f.pret_banque) f.pret_banque = { montant: 0, taux: fiscal.loanInterestBank, duree: fiscal.loanPeriodBank }

  // Ensure tresorerie_mensuelle exists
  if (!result.tresorerie_mensuelle) {
    result.tresorerie_mensuelle = {
      position_initiale: 0,
      delai_paiement_clients_jours: 30,
      delai_paiement_fournisseurs_jours: 60
    }
  }

  // Ensure scenarios_simulation exists
  if (!result.scenarios_simulation) {
    result.scenarios_simulation = {
      worst:   { revenue_products: 0.95, cogs_products: 1.10, revenue_services: 0.60, cogs_services: 1.10, marketing: 1.25, salaries: 1.25, taxes_staff: 1.25, office: 1.10, other: 1.10, travel: 1.10, insurance: 1.10, maintenance: 1.10, third_parties: 1.20 },
      typical: { revenue_products: 1, cogs_products: 1, revenue_services: 1, cogs_services: 1, marketing: 1, salaries: 1, taxes_staff: 1, office: 1, other: 1, travel: 1, insurance: 1, maintenance: 1, third_parties: 1 },
      best:    { revenue_products: 1.20, cogs_products: 0.95, revenue_services: 1.20, cogs_services: 0.95, marketing: 0.85, salaries: 0.85, taxes_staff: 0.85, office: 0.90, other: 0.90, travel: 0.90, insurance: 0.90, maintenance: 0.90, third_parties: 0.85 }
    }
  }

  // Ensure gammes and canaux exist
  if (!result.gammes) {
    result.gammes = {
      range1: { nom: 'LOW END', description: 'Entree de gamme' },
      range2: { nom: 'MEDIUM END', description: 'Gamme intermediaire' },
      range3: { nom: 'HIGH END', description: 'Haut de gamme' }
    }
  }
  if (!result.canaux) {
    result.canaux = {
      channel1: { nom: 'B2B', description: 'Vente aux entreprises' },
      channel2: { nom: 'B2C', description: 'Vente aux particuliers' }
    }
  }

  // Ensure metadata exists
  if (!result.metadata) result.metadata = {}
  const m = result.metadata
  m.extraction_date = m.extraction_date || new Date().toISOString()
  m.sources_used = m.sources_used || ['framework']
  m.confidence_score = m.confidence_score ?? 50
  m.missing_data_notes = m.missing_data_notes || []
  m.cascade_applied = m.cascade_applied || []
  if (!m.data_sources) m.data_sources = {}

  return result as OVOExtractionResult
}

// ═══════════════════════════════════════════════════════════════
// POST-EXTRACTION ENFORCEMENT
// Force declared entrepreneur data over Claude's output
// This is the safety net: even if Claude ignores instructions,
// the real data is enforced programmatically.
// ═══════════════════════════════════════════════════════════════

function enforceDeclaratedData(result: OVOExtractionResult, pmeData: PmeStructuredData, fiscal: FiscalParams): void {
  const h = pmeData.historique
  const hyp = pmeData.hypotheses
  const yearKeys = ['YEAR_MINUS_2', 'YEAR_MINUS_1', 'CURRENT_YEAR', 'YEAR2', 'YEAR3', 'YEAR4', 'YEAR5'] as const
  
  // ═══ 1. Company info from declared data ═══
  if (pmeData.companyName) result.hypotheses.company_name = pmeData.companyName
  if (pmeData.sector) result.hypotheses.sector = pmeData.sector
  if (pmeData.country) result.hypotheses.country = pmeData.country

  // ═══ 2. ENFORCE CA totals — the most critical fix ═══
  // Build target CA array: [N-2, N-1, N, Y1, Y2, Y3, Y4, Y5]
  const targetCA: (number | null)[] = [
    h.caTotal[0] > 0 ? h.caTotal[0] : null,  // N-2: use if declared
    h.caTotal[1] > 0 ? h.caTotal[1] : null,  // N-1: use if declared
    h.caTotal[2] > 0 ? h.caTotal[2] : null,  // N: use if declared (CRITICAL)
  ]
  // Y1-Y5: use entrepreneur objectives if available
  const hasObjectifs = hyp.caObjectifs && hyp.caObjectifs.some(v => v > 0)
  for (let i = 0; i < 5; i++) {
    if (hasObjectifs && hyp.caObjectifs![i] > 0) {
      targetCA.push(hyp.caObjectifs![i])
    } else if (h.caTotal[2] > 0) {
      // Fallback: apply growth rate from declared CA
      const baseCA = targetCA[targetCA.length - 1] || h.caTotal[2]
      const growth = (hyp.croissanceCA[i] || 15) / 100
      targetCA.push(Math.round(baseCA * (1 + growth)))
    } else {
      targetCA.push(null) // Let Claude's estimate stand
    }
  }

  // Now adjust product volumes to match target CA for each year
  if (result.produits?.length > 0) {
    for (let yi = 0; yi < yearKeys.length; yi++) {
      const yk = yearKeys[yi]
      const target = targetCA[yi]
      if (target === null || target === 0) continue // No enforcement for this year

      // Calculate current total CA from products
      let currentTotal = 0
      for (const p of result.produits) {
        if (!p.actif) continue
        const prix = p.prix_unitaire?.[yk] || 0
        const vol = p.volume?.[yk] || 0
        currentTotal += prix * vol
      }

      if (currentTotal <= 0) continue // No products, can't adjust

      // Scale volumes proportionally to match target
      const ratio = target / currentTotal
      if (Math.abs(ratio - 1) > 0.01) { // More than 1% difference
        console.log(`[OVO Enforcement] ${yk}: scaling volumes by ${ratio.toFixed(3)} (${Math.round(currentTotal/1e6)}M → ${Math.round(target/1e6)}M)`)
        for (const p of result.produits) {
          if (!p.actif) continue
          if (p.volume?.[yk]) {
            p.volume[yk] = Math.round(p.volume[yk] * ratio)
          }
        }
      }
    }
  }

  // ═══ 3. ENFORCE key charges from declared data ═══
  // Map declared charges to compte_resultat items
  const declaredCharges = {
    salaires: h.salaires,
    loyers: h.loyers,
    assurances: h.assurances,
    marketing: h.marketing,
    fraisGeneraux: h.fraisGeneraux,
  }
  
  // Enforce CURRENT_YEAR charges in compte_resultat if declared > 0
  const cr = result.compte_resultat
  if (h.loyers[2] > 0 && cr.frais_bureau?.items?.length > 0) {
    // Find or create RENT item
    const rentItem = cr.frais_bureau.items.find(i => i.nom?.match(/rent|loyer/i))
    if (rentItem) {
      rentItem.montants.CURRENT_YEAR = h.loyers[2]
    }
  }
  if (h.marketing[2] > 0 && cr.marketing?.items?.length > 0) {
    const totalMkt = cr.marketing.items.reduce((s, i) => s + (i.montants?.CURRENT_YEAR || 0), 0)
    if (totalMkt > 0 && Math.abs(totalMkt - h.marketing[2]) > h.marketing[2] * 0.05) {
      const ratio = h.marketing[2] / totalMkt
      for (const item of cr.marketing.items) {
        if (item.montants?.CURRENT_YEAR) item.montants.CURRENT_YEAR = Math.round(item.montants.CURRENT_YEAR * ratio)
      }
    }
  }

  // ═══ 4. ENFORCE investissements from declared data ═══
  if (hyp.investissements?.length && result.investissements?.length > 0) {
    // Compare total declared vs Claude total
    const declaredTotal = hyp.investissements.reduce((s, inv) => s + inv.montants.reduce((a, b) => a + b, 0), 0)
    const claudeTotal = result.investissements.reduce((s, inv) => s + (inv.valeur_acquisition || 0), 0)
    if (declaredTotal > 0 && Math.abs(claudeTotal - declaredTotal) > declaredTotal * 0.1) {
      console.log(`[OVO Enforcement] Investments: Claude=${Math.round(claudeTotal/1e6)}M, Declared=${Math.round(declaredTotal/1e6)}M — rebuilding from declared`)
      result.investissements = hyp.investissements.map((inv, idx) => {
        const totalInv = inv.montants.reduce((a, b) => a + b, 0)
        return {
          nom: inv.description,
          categorie: 'FIXED ASSETS' as const,
          annee_acquisition: (result.hypotheses.base_year || new Date().getFullYear()) + Math.floor(idx * 5 / hyp.investissements!.length),
          valeur_acquisition: totalInv,
          taux_amortissement: hyp.amortissement > 0 ? 1 / hyp.amortissement : 0.20
        }
      })
    }
  }

  // ═══ 5. ENFORCE tresorerie from declared data ═══
  if (h.tresoFin[2] > 0) {
    result.tresorerie_mensuelle.position_initiale = h.tresoFin[2]
  } else if (h.tresoDebut[2] > 0) {
    result.tresorerie_mensuelle.position_initiale = h.tresoDebut[2]
  }
  if (h.dso[2] > 0) result.tresorerie_mensuelle.delai_paiement_clients_jours = h.dso[2]
  if (h.dpo[2] > 0) result.tresorerie_mensuelle.delai_paiement_fournisseurs_jours = h.dpo[2]

  // ═══ 6. Update metadata with source tracking ═══
  const ds = result.metadata.data_sources || {}
  ds.ca_current_year = h.caTotal[2] > 0 ? 'declared' : 'ai_estimate'
  ds.ca_year_minus_2 = h.caTotal[0] > 0 ? 'declared' : 'ai_estimate'
  ds.ca_year_minus_1 = h.caTotal[1] > 0 ? 'declared' : 'ai_estimate'
  ds.ca_projections = hasObjectifs ? 'entrepreneur_target' : 'ai_estimate'
  ds.charges = (h.salaires[2] > 0 || h.loyers[2] > 0) ? 'declared' : 'ai_estimate'
  ds.investissements = hyp.investissements?.length ? 'declared' : 'ai_estimate'
  ds.personnel = h.salaires[2] > 0 ? 'declared' : 'ai_estimate'
  result.metadata.data_sources = ds

  // Update confidence score: higher when more declared data
  const declaredCount = Object.values(ds).filter(v => v === 'declared').length
  const totalFields = Object.values(ds).length
  const declaredBonus = Math.round((declaredCount / totalFields) * 30) // up to +30 for all declared
  result.metadata.confidence_score = Math.min(100, (result.metadata.confidence_score || 50) + declaredBonus)

  // Add notes about enforcement
  if (!result.metadata.cascade_applied) result.metadata.cascade_applied = []
  result.metadata.cascade_applied.push('v2: PME structured data enforced over Claude output')
  if (h.caTotal[2] > 0) {
    result.metadata.cascade_applied.push(`CA N enforced: ${h.caTotal[2].toLocaleString('fr-FR')} CFA (declared)`)
  }
  if (hasObjectifs) {
    result.metadata.cascade_applied.push(`CA Y1-Y5 from entrepreneur targets: ${hyp.caObjectifs!.map(v => Math.round(v/1e6) + 'M').join(', ')}`)
  }

  console.log(`[OVO Enforcement] Complete. Sources: ${JSON.stringify(ds)}. Confidence: ${result.metadata.confidence_score}`)
}
