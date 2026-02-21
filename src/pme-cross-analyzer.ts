// ═══════════════════════════════════════════════════════════════
// CORRECTION 3 — Croisement BMC ↔ Financiers
// Detecte les incoherences entre le modele economique (BMC)
// et les donnees financieres calculees
// ═══════════════════════════════════════════════════════════════

import { callClaudeJSON, isValidApiKey } from './claude-api'
import type { PmeAnalysisResult, PmeInputData } from './framework-pme-engine'

// ─── TYPES ───

export interface CrossCoherence {
  element_bmc: string
  element_financier: string
  verdict: 'coherent' | 'incoherent' | 'partiel'
  commentaire: string
}

export interface CrossIncoherence {
  element_bmc: string
  element_financier: string
  severite: 'critique' | 'haute' | 'moyenne' | 'faible'
  impact_score: number
  recommandation: string
  estimation_impact_xof?: number
}

export interface CrossAnalysisResult {
  coherences: CrossCoherence[]
  incoherences: CrossIncoherence[]
  donnees_manquantes_detectees: string[]
  score_coherence: number // 0-100
  resume: string
}

// ─── PROMPT ───

const SYSTEM_PROMPT_CROISEMENT = `Tu es un analyste financier expert PME Afrique de l'Ouest.

MISSION : Compare le Business Model Canvas (BMC) et les donnees financieres calculees.
Detecte les INCOHERENCES entre le modele economique et les chiffres.

CONTROLES DE COHERENCE A EFFECTUER :

1. BMC -> REVENUS :
   - Les "Flux de revenus" du BMC sont-ils refletes dans le CA ?
   - Le nombre de "Segments clients" est-il compatible avec le CA ?
   - Les "Canaux" de distribution impliquent-ils des couts non comptes ?

2. BMC -> COUTS :
   - Les "Activites cles" ont-elles des couts associes dans les charges ?
   - Les "Ressources cles" sont-elles dans le CAPEX ?
   - Les "Partenaires cles" impliquent-ils des couts non comptes ?

3. BMC -> STRUCTURE :
   - La "Proposition de valeur" necessite-t-elle des investissements R&D ?
   - Les "Relations clients" impliquent-elles des couts marketing ?
   - Le modele economique est-il reflété dans la structure de revenus ?

4. VERIFICATIONS CHIFFREES :
   - CA / employe est-il realiste pour le secteur ?
     (Services CI : 5-20M/employe, Commerce : 10-50M, Industrie : 8-25M)
   - Marge brute est-elle coherente avec le secteur du BMC ?
   - BFR est-il coherent avec le type de clients (B2B = DSO long, B2C = court) ?
   - CAPEX / CA An1 : >200% = alerte, 50-200% = OK, <50% = leger

FORMAT JSON STRICT :
{
  "coherences": [
    {
      "element_bmc": "<string>",
      "element_financier": "<string>",
      "verdict": "coherent|incoherent|partiel",
      "commentaire": "<string>"
    }
  ],
  "incoherences": [
    {
      "element_bmc": "<string>",
      "element_financier": "<string>",
      "severite": "critique|haute|moyenne|faible",
      "impact_score": <number -15 to 0>,
      "recommandation": "<string avec montant FCFA si applicable>",
      "estimation_impact_xof": <number|null>
    }
  ],
  "donnees_manquantes_detectees": ["<string>"],
  "score_coherence": <0-100>,
  "resume": "<2-3 phrases de synthese>"
}`

// ─── MAIN FUNCTION ───

/**
 * Cross-analyze BMC content with financial analysis results
 * Detects inconsistencies between business model and financials
 * 
 * @param bmcContent - The BMC deliverable content (text/JSON)
 * @param pmeData - The input financial data
 * @param analysis - The computed financial analysis
 * @param apiKey - Claude API key
 * @returns Cross-analysis results with coherences and incoherences
 */
export async function crossAnalyzeBmcFinancials(
  bmcContent: string,
  pmeData: PmeInputData,
  analysis: PmeAnalysisResult,
  apiKey: string
): Promise<CrossAnalysisResult> {
  
  if (!isValidApiKey(apiKey) || !bmcContent || bmcContent.length < 50) {
    console.log('[Cross-Analyzer] Skipping: no valid API key or BMC content')
    return {
      coherences: [],
      incoherences: [],
      donnees_manquantes_detectees: [],
      score_coherence: -1, // -1 = not analyzed
      resume: 'Analyse croisee non effectuee (BMC non disponible ou cle API manquante)'
    }
  }

  // Build financial summary for the prompt
  const hc = analysis.historique
  const h = pmeData.historique

  let financialSummary = `## DONNEES FINANCIERES CALCULEES\n\n`
  financialSummary += `Entreprise: ${pmeData.companyName}\n`
  financialSummary += `Secteur: ${pmeData.sector}\n`
  financialSummary += `Pays: ${pmeData.country}\n\n`
  
  financialSummary += `CA Annee N: ${h.caTotal[2]} FCFA\n`
  financialSummary += `Activites (${pmeData.activities.length}):\n`
  for (let i = 0; i < pmeData.activities.length; i++) {
    const act = pmeData.activities[i]
    const m = analysis.margesParActivite[i]
    financialSummary += `  - ${act.name}: CA ${h.caByActivity[i]?.[2] || 0} FCFA`
    if (m) financialSummary += `, marge ${m.margePct}%, classé "${m.classification}"`
    financialSummary += `\n`
  }
  
  financialSummary += `\nMarge brute: ${hc.margeBrutePct[2]}%\n`
  financialSummary += `Charges fixes / CA: ${hc.chargesFixesSurCA[2]}%\n`
  financialSummary += `Masse salariale / CA: ${hc.masseSalarialeSurCA[2]}%\n`
  financialSummary += `EBITDA: ${hc.ebitda[2]} FCFA (${hc.margeEbitdaPct[2]}%)\n`
  financialSummary += `Tresorerie fin: ${h.tresoFin[2]} FCFA\n`
  financialSummary += `DSO: ${h.dso[2]}j | DPO: ${h.dpo[2]}j | Stock: ${h.stockJours[2]}j\n`
  financialSummary += `BFR / CA: ${hc.bfrSurCA[2]}%\n`
  financialSummary += `DSCR: ${hc.dscr[2]}\n`
  financialSummary += `\nSalaires: ${h.salaires[2]} FCFA\n`
  financialSummary += `Loyers: ${h.loyers[2]} FCFA\n`
  financialSummary += `Assurances: ${h.assurances[2]} FCFA\n`
  financialSummary += `Marketing: ${h.marketing[2]} FCFA\n`
  financialSummary += `Transport/Logistique: inclus dans frais generaux (${h.fraisGeneraux[2]} FCFA)\n`
  financialSummary += `\nCAPEX total 5 ans: ${pmeData.hypotheses.capex.reduce((s, v) => s + v, 0)} FCFA\n`
  
  if (analysis.alertes.length > 0) {
    financialSummary += `\nALERTES DETECTEES:\n`
    for (const a of analysis.alertes) {
      financialSummary += `  [${a.type}] ${a.message}\n`
    }
  }

  const userPrompt = `Voici le BMC et les donnees financieres. Detecte les incoherences.

## BUSINESS MODEL CANVAS (BMC)
${bmcContent.slice(0, 6000)}

${financialSummary}

Analyse la coherence BMC <-> Financiers et reponds en JSON strict.`

  try {
    const result = await callClaudeJSON<CrossAnalysisResult>({
      apiKey,
      systemPrompt: SYSTEM_PROMPT_CROISEMENT,
      userPrompt,
      maxTokens: 3000,
      timeoutMs: 20_000,
      maxRetries: 2,
      label: 'BMC-Finance Cross'
    })

    console.log(`[Cross-Analyzer] Score coherence: ${result.score_coherence}, incoherences: ${result.incoherences?.length || 0}`)

    return {
      coherences: result.coherences || [],
      incoherences: result.incoherences || [],
      donnees_manquantes_detectees: result.donnees_manquantes_detectees || [],
      score_coherence: result.score_coherence ?? 50,
      resume: result.resume || ''
    }
  } catch (err: any) {
    console.error('[Cross-Analyzer] Failed:', err.message)
    return {
      coherences: [],
      incoherences: [],
      donnees_manquantes_detectees: [],
      score_coherence: -1,
      resume: `Analyse croisee echouee: ${err.message}`
    }
  }
}
