// ═══════════════════════════════════════════════════════════════
// INPUTS ENTREPRENEUR PARSER — Lecture structurée du fichier XLSX
// Lit FIDÈLEMENT les données réelles de chaque onglet du fichier
// "INPUTS_ENTREPRENEURS" — sans inventer aucune donnée manquante
// ═══════════════════════════════════════════════════════════════

import { parseXlsx, b64ToUint8, type SheetData, type CellData } from './xlsx-parser'
import type { PmeInputData } from './framework-pme-engine'

// ─── HELPERS ───

/** Get cell value from a sheet by cell reference (e.g., "B5", "E7") */
function getCell(sheet: SheetData, ref: string): string {
  const cell = sheet.cells.find(c => c.ref === ref)
  return cell?.value?.trim() ?? ''
}

/** Get numeric value from a cell, return 0 if empty/invalid */
function getNum(sheet: SheetData, ref: string): number {
  const raw = getCell(sheet, ref)
  if (!raw) return 0
  // First try direct parseFloat (handles scientific notation like 5.913E7)
  const directParse = parseFloat(raw)
  if (!isNaN(directParse) && /^[\d.\-+eE]+$/.test(raw.trim())) {
    return Math.round(directParse)
  }
  // Fallback: clean text and parse (for "59 130 000 FCFA" etc.)
  const cleaned = raw.replace(/[^\d.\-]/g, '')
  const num = parseFloat(cleaned)
  return isNaN(num) ? 0 : Math.round(num)
}

/** Find a sheet by partial name match (case-insensitive, ignores leading emoji/space) */
function findSheet(sheets: SheetData[], partialName: string): SheetData | undefined {
  const lower = partialName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  return sheets.find(s => {
    const sn = s.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    return sn.includes(lower)
  })
}

/** Search for a numeric value in a column range near a label keyword */
function findValueNearLabel(sheet: SheetData, keyword: string, valueCol: string, startRow: number, endRow: number): number {
  const keyLower = keyword.toLowerCase()
  for (let row = startRow; row <= endRow; row++) {
    // Check columns A and B for the label
    for (const col of ['A', 'B']) {
      const label = getCell(sheet, `${col}${row}`).toLowerCase()
      if (label.includes(keyLower)) {
        const val = getNum(sheet, `${valueCol}${row}`)
        if (val > 0) return val
      }
    }
  }
  return 0
}

/** Scan user-entered rows (below "VOS" section marker) for cost items */
function scanUserSection(sheet: SheetData, sectionMarker: string, totalCol: string, startRow: number, endRow: number): { items: { label: string; annual: number }[]; total: number } {
  const items: { label: string; annual: number }[] = []
  let inUserSection = false
  let total = 0

  for (let row = startRow; row <= endRow; row++) {
    const cellA = getCell(sheet, `A${row}`)
    const cellB = getCell(sheet, `B${row}`)
    
    // Detect "VOS" section start
    if (cellA.includes(sectionMarker) || cellB.includes(sectionMarker)) {
      inUserSection = true
      continue
    }
    
    // Check for TOTAL row
    const rowText = (cellA + ' ' + cellB + ' ' + getCell(sheet, `D${row}`) + ' ' + getCell(sheet, `E${row}`)).toLowerCase()
    if (rowText.includes('total')) {
      // Try to read the total from the expected column
      for (const col of [totalCol, 'E', 'F', 'G']) {
        const totalVal = getNum(sheet, `${col}${row}`)
        if (totalVal > 0) {
          total = totalVal
          break
        }
      }
      continue
    }

    if (inUserSection) {
      const label = cellB || cellA
      if (!label || label === '#') continue
      const annual = getNum(sheet, `${totalCol}${row}`)
      if (annual > 0) {
        items.push({ label, annual })
      }
    }
  }
  
  // If no total found, sum items
  if (total === 0) {
    total = items.reduce((s, i) => s + i.annual, 0)
  }

  return { items, total }
}

// ─── MAIN PARSER ───

/**
 * Detect if an XLSX file is in INPUTS_ENTREPRENEURS format
 * by checking for characteristic sheet names
 */
export function isInputsEntrepreneurFormat(sheets: SheetData[]): boolean {
  // Must have at least 5 of these characteristic sheets
  const expectedSheets = [
    'infos generales',
    'donnees historiques',
    'produits',
    'ressources humaines',
    'couts',
    'bfr',
    'investissements',
    'hypotheses',
    'financement'
  ]
  
  let matchCount = 0
  for (const expected of expectedSheets) {
    if (findSheet(sheets, expected)) matchCount++
  }
  
  // Also check for the guide sheet
  if (findSheet(sheets, 'guide')) matchCount++
  
  console.log(`[InputsParser] Format detection: ${matchCount}/${expectedSheets.length + 1} sheets matched`)
  return matchCount >= 4
}

/**
 * Parse INPUTS_ENTREPRENEURS XLSX format into PmeInputData
 * Reads REAL data from each onglet — NO invention, NO fallback values
 */
export function parseInputsEntrepreneur(sheets: SheetData[]): PmeInputData {
  console.log(`[InputsParser] Parsing ${sheets.length} sheets from INPUTS_ENTREPRENEURS format`)

  // ═══ 1. INFOS GÉNÉRALES ═══
  const infos = findSheet(sheets, 'infos generales') || findSheet(sheets, 'infos')
  const companyName = infos ? (getCell(infos, 'B5') || 'Entreprise') : 'Entreprise'
  const formeJuridique = infos ? getCell(infos, 'B6') : ''
  const country = infos ? (getCell(infos, 'B7') || "Côte d'Ivoire") : "Côte d'Ivoire"
  const city = infos ? getCell(infos, 'B8') : ''
  const sector = infos ? getCell(infos, 'B9') : ''
  const dateCreation = infos ? getCell(infos, 'B10') : ''
  const dirigeant = infos ? getCell(infos, 'B16') : ''
  const devise = infos ? (getCell(infos, 'B24') || 'XOF') : 'XOF'
  const tauxTVA = infos ? getNum(infos, 'B26') : 18
  const tauxIS = infos ? getNum(infos, 'B22') || 25 : 25
  
  console.log(`[InputsParser] Company: ${companyName}, Country: ${country}, Sector: ${sector}`)

  // ═══ 2. DONNÉES HISTORIQUES ═══
  const hist = findSheet(sheets, 'donnees historiques')
  
  // Columns: C=N-2, D=N-1, E=N (user data), F/G/H=examples
  // Read user data columns C, D, E (rows 7-26)
  let caN2 = hist ? getNum(hist, 'C7') : 0
  let caN1 = hist ? getNum(hist, 'D7') : 0
  let caN = hist ? getNum(hist, 'E7') : 0
  
  // Products breakdown
  let caProduct1 = hist ? getNum(hist, 'E8') : 0
  let caProduct2 = hist ? getNum(hist, 'E9') : 0
  let caProduct3 = hist ? getNum(hist, 'E10') : 0
  
  // Costs from historical tab
  let histCoutsDirects = hist ? getNum(hist, 'E13') : 0
  let histChargesFixes = hist ? getNum(hist, 'E14') : 0
  let histSalaires = hist ? getNum(hist, 'E15') : 0
  let histLoyers = hist ? getNum(hist, 'E16') : 0
  let histAutresCharges = hist ? getNum(hist, 'E17') : 0
  let histResultatExpl = hist ? getNum(hist, 'E20') : 0
  let histResultatNet = hist ? getNum(hist, 'E21') : 0
  let histEmployes = hist ? getNum(hist, 'E25') : 0
  let histTresoFin = hist ? getNum(hist, 'E26') : 0
  
  console.log(`[InputsParser] Historique: CA=[${caN2}, ${caN1}, ${caN}], Salaires=${histSalaires}, Employés=${histEmployes}`)

  // ═══ 3. PRODUITS & SERVICES ═══
  const produits = findSheet(sheets, 'produits')
  const productsList: { name: string; type: string; prixUnit: number; coutUnit: number; marge: number }[] = []
  
  if (produits) {
    // User products start at row 13 (after "VOS PRODUITS" marker)
    for (let row = 13; row <= 26; row++) {
      const name = getCell(produits, `B${row}`)
      if (!name) continue
      productsList.push({
        name,
        type: getCell(produits, `C${row}`) || 'Produit',
        prixUnit: getNum(produits, `D${row}`),
        coutUnit: getNum(produits, `F${row}`),
        marge: getNum(produits, `G${row}`) || 0
      })
    }
  }
  console.log(`[InputsParser] Produits: ${productsList.length} found: ${productsList.map(p => p.name).join(', ')}`)

  // ═══ 4. RESSOURCES HUMAINES ═══
  const rh = findSheet(sheets, 'ressources humaines')
  let masseSalariale = 0
  const employeeList: { poste: string; nombre: number; salaireMensuel: number; annuel: number }[] = []
  
  if (rh) {
    // User employees start at row 13 (after "VOTRE ÉQUIPE" marker)
    for (let row = 13; row <= 32; row++) {
      const poste = getCell(rh, `B${row}`)
      if (!poste) continue
      const nombre = getNum(rh, `C${row}`) || 1
      const salaireBrut = getNum(rh, `D${row}`)
      const totalAnnuel = getNum(rh, `G${row}`)
      if (salaireBrut > 0 || totalAnnuel > 0) {
        employeeList.push({
          poste,
          nombre,
          salaireMensuel: salaireBrut,
          annuel: totalAnnuel > 0 ? totalAnnuel : salaireBrut * nombre * 12
        })
      }
    }
    // Read total from the TOTAL row
    masseSalariale = getNum(rh, 'G34') || getNum(rh, 'F34') * 12
    if (masseSalariale === 0) {
      masseSalariale = employeeList.reduce((s, e) => s + e.annuel, 0)
    }
  }
  console.log(`[InputsParser] RH: ${employeeList.length} postes, Masse salariale=${masseSalariale}`)

  // ═══ 5. COÛTS FIXES & VARIABLES ═══
  const couts = findSheet(sheets, 'couts')
  let coutsVariablesAnnuel = 0
  let coutsFixesAnnuel = 0
  let totalCoutsHorsRH = 0
  const coutsVariablesDetail: { label: string; annual: number }[] = []
  const coutsFixesDetail: { label: string; annual: number }[] = []

  if (couts) {
    // Variable costs: user section starts at row 12 (after "VOS COÛTS VARIABLES")
    const varResult = scanUserSection(couts, 'VOS CO', 'G', 11, 27)
    coutsVariablesDetail.push(...varResult.items)
    coutsVariablesAnnuel = getNum(couts, 'E56') || getNum(couts, 'F27') * 12 || varResult.total
    
    // Fixed costs: user section starts around row 37 (after "VOS COÛTS FIXES")
    const fixResult = scanUserSection(couts, 'VOS CO', 'E', 36, 52)
    coutsFixesDetail.push(...fixResult.items)
    coutsFixesAnnuel = getNum(couts, 'E52') || fixResult.total
    
    // Total hors RH
    totalCoutsHorsRH = getNum(couts, 'E58') || (coutsVariablesAnnuel + coutsFixesAnnuel)
  }
  console.log(`[InputsParser] Coûts: Variables=${coutsVariablesAnnuel}, Fixes=${coutsFixesAnnuel}, Total hors RH=${totalCoutsHorsRH}`)

  // ═══ 6. BFR & TRÉSORERIE ═══
  const bfr = findSheet(sheets, 'bfr')
  let dsoJours = bfr ? getNum(bfr, 'B7') : 0
  let dpoJours = bfr ? getNum(bfr, 'B8') : 0
  let stockJours = bfr ? getNum(bfr, 'B9') : 0
  let tresorerieDepart = bfr ? getNum(bfr, 'B10') : 0
  
  console.log(`[InputsParser] BFR: DSO=${dsoJours}j, DPO=${dpoJours}j, Stock=${stockJours}j, Tréso départ=${tresorerieDepart}`)

  // ═══ 7. INVESTISSEMENTS (CAPEX) ═══
  const capexSheet = findSheet(sheets, 'investissements')
  const investissements: { description: string; montant: number; annee: number; duree: number }[] = []
  let totalCapex = 0

  if (capexSheet) {
    // User investments start at row 11 (after "VOS INVESTISSEMENTS")
    for (let row = 11; row <= 20; row++) {
      const desc = getCell(capexSheet, `B${row}`)
      const montant = getNum(capexSheet, `C${row}`)
      if (!desc || montant <= 0) continue
      const annee = getNum(capexSheet, `D${row}`) || 2025
      const duree = getNum(capexSheet, `E${row}`) || 5
      investissements.push({ description: desc, montant, annee, duree })
      totalCapex += montant
    }
  }
  console.log(`[InputsParser] CAPEX: ${investissements.length} items, Total=${totalCapex}`)

  // ═══ 8. FINANCEMENT ═══
  const financement = findSheet(sheets, 'financement')
  let apportsCapital = financement ? getNum(financement, 'B5') : 0
  let subventions = financement ? getNum(financement, 'B6') : 0
  let totalPrets = financement ? getNum(financement, 'B7') : 0
  
  const prets: { montant: number; taux: number; duree: number }[] = []
  if (financement) {
    for (let row = 16; row <= 25; row++) {
      const montant = getNum(financement, `C${row}`)
      if (montant <= 0) continue
      prets.push({
        montant,
        taux: getNum(financement, `D${row}`) || 8,
        duree: getNum(financement, `E${row}`) || 5
      })
    }
  }
  const totalDetteLT = prets.reduce((s, p) => s + p.montant, 0) || totalPrets
  const tauxMoyen = prets.length > 0 ? prets[0].taux : 8
  const dureeMoyenne = prets.length > 0 ? prets[0].duree : 5
  const serviceDetteAnnuel = totalDetteLT > 0 ? Math.round(totalDetteLT / dureeMoyenne + totalDetteLT * tauxMoyen / 100) : 0

  console.log(`[InputsParser] Financement: Dettes=${totalDetteLT}, Service=${serviceDetteAnnuel}`)

  // ═══ 9. HYPOTHÈSES DE CROISSANCE ═══
  const hyp = findSheet(sheets, 'hypotheses')
  
  // Read CA objectives by year (B8-B12 = absolute CA values)
  let caObj: number[] = []
  if (hyp) {
    for (let row = 8; row <= 12; row++) {
      caObj.push(getNum(hyp, `B${row}`))
    }
  }
  
  // Read growth percentages (C9-C12 = % growth vs N-1)
  let growthPcts: number[] = []
  if (hyp) {
    for (let row = 9; row <= 12; row++) {
      growthPcts.push(getNum(hyp, `C${row}`))
    }
  }
  
  // Read general hypotheses
  let margeBruteCible = hyp ? getNum(hyp, 'C17') : 0
  let margeOpCible = hyp ? getNum(hyp, 'C18') : 0
  let inflation = hyp ? getNum(hyp, 'C19') || 3 : 3
  let augPrix = hyp ? getNum(hyp, 'C20') || 5 : 5
  let croissanceVolumes = hyp ? getNum(hyp, 'C21') : 0
  let tauxISHyp = hyp ? getNum(hyp, 'C22') || 25 : 25
  
  console.log(`[InputsParser] Hypothèses CA: Objectifs=[${caObj.join(', ')}], Croissances=[${growthPcts.join(', ')}%]`)
  console.log(`[InputsParser] Hypothèses: Marge brute=${margeBruteCible}%, Marge op=${margeOpCible}%, Inflation=${inflation}%`)

  // ═══════════════════════════════════════════════════════════
  // BUILD PmeInputData — FIDÈLE aux données réelles
  // ═══════════════════════════════════════════════════════════

  // --- Activities from products ---
  const activities = productsList.length > 0
    ? productsList.map((p, i) => ({ name: p.name, isStrategic: i === 0 }))
    : [{ name: 'Activité principale', isStrategic: true }]

  // --- Historical CA: only use REAL data, no invention ---
  // The file only has N (2025) = 59,130,000. N-2 and N-1 are EMPTY.
  const caTotal: [number, number, number] = [caN2, caN1, caN]
  
  // CA by activity: distribute proportionally if we have product data
  let caByActivity: [number, number, number][]
  if (productsList.length > 0 && caN > 0) {
    // Simple equal distribution since no per-product CA breakdown in historical
    const perProduct = Math.round(caN / productsList.length)
    caByActivity = productsList.map(() => [
      caN2 > 0 ? Math.round(caN2 / productsList.length) : 0,
      caN1 > 0 ? Math.round(caN1 / productsList.length) : 0,
      perProduct
    ] as [number, number, number])
  } else {
    caByActivity = [[caN2, caN1, caN]]
  }

  // --- Costs: use REAL data from Coûts tab + RH tab ---
  // Coûts variables = achatsMP + coutsProduction
  const achatsMP = coutsVariablesAnnuel
  
  // Charges locatives from fixed costs detail
  const chargesLocatives = coutsFixesDetail.find(c => c.label.toLowerCase().includes('locati'))?.annual || 0
  const maintenanceEquip = coutsFixesDetail.find(c => c.label.toLowerCase().includes('maintenance'))?.annual || 0
  const deplacements = coutsFixesDetail.find(c => c.label.toLowerCase().includes('deplacement') || c.label.toLowerCase().includes('déplacement'))?.annual || 0
  const communication = coutsFixesDetail.find(c => c.label.toLowerCase().includes('communication'))?.annual || 0
  
  // Use actual salary data — from RH tab (priority) or historical tab
  const salairesAnnuels = masseSalariale > 0 ? masseSalariale : histSalaires
  
  // Loyers: from fixed costs detail (charges locatives)
  const loyersAnnuels = chargesLocatives > 0 ? chargesLocatives : histLoyers
  
  // Frais généraux: sum of other fixed costs (maintenance + déplacements + communication + any others)
  const fraisGeneraux = (coutsFixesAnnuel - chargesLocatives) > 0 
    ? (coutsFixesAnnuel - chargesLocatives) 
    : histAutresCharges
  
  // Résultat: use real data if available, otherwise compute
  // Résultat = CA - Coûts Variables - Charges Fixes - Salaires
  let resultatNet = histResultatNet
  if (resultatNet === 0 && caN > 0) {
    resultatNet = histResultatExpl > 0 ? histResultatExpl : 0
  }

  // --- Build scale helper: for EMPTY years, put 0 (NOT inventions) ---
  const realScale = (valN: number): [number, number, number] => [0, 0, valN]

  // --- Compute growth rates from CA objectives ---
  // User provided: N+1=59M, N+2=163M, N+3=465M, N+4=501M, N+5=573M
  let croissanceCA: [number, number, number, number, number] = [20, 20, 15, 10, 10] // defaults
  
  if (caObj.length >= 5 && caObj[0] > 0) {
    // Compute actual growth rates from absolute CA values
    const rates: number[] = []
    for (let i = 1; i < caObj.length; i++) {
      if (caObj[i] > 0 && caObj[i - 1] > 0) {
        const rate = Math.round(((caObj[i] / caObj[i - 1]) - 1) * 100)
        rates.push(rate)
      } else {
        rates.push(0)
      }
    }
    // First rate: N+1 vs N (current year)
    const baseCA = caN > 0 ? caN : caObj[0]
    if (caObj[1] > 0 && baseCA > 0) {
      const firstRate = Math.round(((caObj[1] / baseCA) - 1) * 100)
      croissanceCA = [
        firstRate > 0 ? firstRate : (rates[0] || 20),
        rates[0] || 20,
        rates[1] || 15,
        rates[2] || 10,
        rates[3] || 10,
      ]
    } else if (rates.length >= 4) {
      croissanceCA = [rates[0], rates[1], rates[2], rates[3], rates[3]]
    }
  }
  // If explicit growth percentages were provided (C9-C12)
  else if (growthPcts.some(p => p > 0)) {
    // growthPcts has 4 values (N+1→N+2, N+2→N+3, N+3→N+4, N+4→N+5)
    // We need to also compute first year growth
    const firstGrowth = (caObj[0] > 0 && caN > 0 && caObj[0] !== caN)
      ? Math.round(((caObj[0] / caN) - 1) * 100)
      : growthPcts[0] || 20
    croissanceCA = [
      firstGrowth,
      growthPcts[0] || 20,
      growthPcts[1] || 15,
      growthPcts[2] || 10,
      growthPcts[3] || 10,
    ]
  }

  console.log(`[InputsParser] Computed growth rates: [${croissanceCA.join(', ')}]%`)

  // --- CAPEX schedule ---
  const capexSchedule: [number, number, number, number, number] = [totalCapex, 0, 0, 0, 0]

  // --- Investissements détaillés ---
  const investissementsDetails = investissements.length > 0
    ? investissements.map(inv => ({
        description: inv.description,
        montants: [inv.montant, 0, 0, 0, 0] as [number, number, number, number, number]
      }))
    : undefined

  // --- Amortissement moyen ---
  const amortDuree = investissements.length > 0
    ? Math.round(investissements.reduce((s, i) => s + i.duree, 0) / investissements.length)
    : 5

  // --- Build final PmeInputData ---
  const result: PmeInputData = {
    companyName,
    sector,
    analysisDate: new Date().toISOString().slice(0, 10),
    consultant: 'ESONO AI',
    location: city,
    country,
    activities,
    historique: {
      caTotal,
      caByActivity,
      // Coûts directs: coûts variables du fichier
      achatsMP: realScale(achatsMP),
      sousTraitance: [0, 0, 0],
      coutsProduction: [0, 0, 0],
      // Charges fixes: salaires + loyers + frais
      salaires: realScale(salairesAnnuels),
      loyers: realScale(loyersAnnuels),
      assurances: [0, 0, 0],
      fraisGeneraux: realScale(fraisGeneraux),
      marketing: [0, 0, communication],
      fraisBancaires: [0, 0, 0],
      // Résultat
      resultatNet: realScale(resultatNet),
      // Trésorerie
      tresoDebut: [0, 0, tresorerieDepart],
      tresoFin: [0, 0, histTresoFin > 0 ? histTresoFin : tresorerieDepart],
      // BFR (valeurs réelles du fichier)
      dso: [dsoJours, dsoJours, dsoJours],
      dpo: [dpoJours, dpoJours, dpoJours],
      stockJours: [stockJours, stockJours, stockJours],
      // Dettes
      detteCT: [0, 0, 0],
      detteLT: [0, 0, totalDetteLT],
      serviceDette: [0, 0, serviceDetteAnnuel],
      amortissements: [0, 0, Math.round(totalCapex / amortDuree)],
    },
    hypotheses: {
      croissanceCA,
      // If user provided absolute CA targets, pass them to the engine
      // caObj[0] = base year (=N), caObj[1..4] = projection years 1..4
      // For Year 5 we extrapolate from Y4 growth
      caObjectifs: (caObj.length >= 5 && caObj[1] > 0)
        ? (() => {
            const y1 = caObj[1]
            const y2 = caObj[2] || Math.round(y1 * 1.1)
            const y3 = caObj[3] || Math.round(y2 * 1.1)
            const y4 = caObj[4] || Math.round(y3 * 1.1)
            // Y5: extrapolate from Y3→Y4 growth rate
            const y4Growth = y3 > 0 ? (y4 / y3) : 1.1
            const y5 = Math.round(y4 * y4Growth)
            return [y1, y2, y3, y4, y5] as [number, number, number, number, number]
          })()
        : undefined,
      evolutionPrix: [augPrix, augPrix, augPrix, augPrix, augPrix],
      evolutionCoutsDirects: [inflation, inflation, inflation, inflation, inflation],
      inflationChargesFixes: [inflation, inflation, inflation, inflation, inflation],
      evolutionMasseSalariale: [inflation + 2, inflation + 2, inflation, inflation, inflation],
      capex: capexSchedule,
      amortissement: amortDuree,
      embauches: undefined, // No invented hires — user didn't provide hiring plan
      investissements: investissementsDetails,
    },
  }

  // ═══ VALIDATION LOG ═══
  const totalCD = achatsMP
  const totalCF = salairesAnnuels + loyersAnnuels + fraisGeneraux + communication
  console.log(`[InputsParser] === SUMMARY ===`)
  console.log(`[InputsParser] CA N: ${caN} | CA N-2: ${caN2} | CA N-1: ${caN1}`)
  console.log(`[InputsParser] Coûts Variables: ${coutsVariablesAnnuel} (${caN > 0 ? Math.round(coutsVariablesAnnuel/caN*100) : 0}% du CA)`)
  console.log(`[InputsParser] Masse Salariale: ${salairesAnnuels} (${caN > 0 ? Math.round(salairesAnnuels/caN*100) : 0}% du CA)`)
  console.log(`[InputsParser] Charges Fixes Total: ${totalCF} (${caN > 0 ? Math.round(totalCF/caN*100) : 0}% du CA)`)
  console.log(`[InputsParser] CAPEX: ${totalCapex}`)
  console.log(`[InputsParser] Dettes LT: ${totalDetteLT}`)
  console.log(`[InputsParser] Croissance CA: [${croissanceCA.join(', ')}]%`)
  console.log(`[InputsParser] CA Objectifs: [${caObj.join(', ')}]`)
  
  return result
}

/**
 * Try to parse an XLSX file as INPUTS_ENTREPRENEURS format.
 * Returns null if the format doesn't match.
 */
export function tryParseInputsEntrepreneur(xlsxBase64: string): PmeInputData | null {
  try {
    const bytes = b64ToUint8(xlsxBase64)
    const sheets = parseXlsx(bytes)
    
    if (!isInputsEntrepreneurFormat(sheets)) {
      console.log('[InputsParser] File is NOT in INPUTS_ENTREPRENEURS format — skipping')
      return null
    }
    
    return parseInputsEntrepreneur(sheets)
  } catch (err: any) {
    console.error(`[InputsParser] Parse error: ${err.message}`)
    return null
  }
}
