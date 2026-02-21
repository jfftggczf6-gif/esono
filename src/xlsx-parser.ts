// ═══════════════════════════════════════════════════════════════
// XLSX PARSER — Parse .xlsx files using fflate (no Node.js APIs)
// Extracts cell data from all worksheets as structured text
// ═══════════════════════════════════════════════════════════════

import { unzipSync } from 'fflate'

interface CellData {
  ref: string
  value: string
  type: 'number' | 'string' | 'bool' | 'formula'
}

interface SheetData {
  name: string
  cells: CellData[]
}

/**
 * Parse an .xlsx file from a Uint8Array (binary content)
 * Returns structured data: sheet names + cell values
 */
export function parseXlsx(data: Uint8Array): SheetData[] {
  const files = unzipSync(data)
  const decoder = new TextDecoder('utf-8')
  
  // 1. Read shared strings
  const sharedStrings: string[] = []
  const ssPath = 'xl/sharedStrings.xml'
  if (files[ssPath]) {
    const ssXml = decoder.decode(files[ssPath])
    // Extract <t> elements from shared strings
    const tRegex = /<t[^>]*>([\s\S]*?)<\/t>/g
    let m
    while ((m = tRegex.exec(ssXml)) !== null) {
      sharedStrings.push(m[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"'))
    }
  }
  
  // 2. Read workbook.xml for sheet names
  const sheetNames: string[] = []
  const wbPath = 'xl/workbook.xml'
  if (files[wbPath]) {
    const wbXml = decoder.decode(files[wbPath])
    const sheetRegex = /<sheet\s+name="([^"]+)"/g
    let m
    while ((m = sheetRegex.exec(wbXml)) !== null) {
      sheetNames.push(m[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>'))
    }
  }
  
  // 3. Read each sheet
  const sheets: SheetData[] = []
  for (let i = 0; i < 20; i++) {
    const sheetPath = `xl/worksheets/sheet${i + 1}.xml`
    if (!files[sheetPath]) break
    
    const sheetXml = decoder.decode(files[sheetPath])
    const cells: CellData[] = []
    
    // Parse cells: <c r="A1" t="s"><v>0</v></c>
    const cellRegex = /<c\s+r="([A-Z]+\d+)"([^>]*)>([\s\S]*?)<\/c>/g
    let cm
    while ((cm = cellRegex.exec(sheetXml)) !== null) {
      const ref = cm[1]
      const attrs = cm[2]
      const inner = cm[3]
      
      // Get type
      const typeMatch = attrs.match(/\s+t="([^"]+)"/)
      const cellType = typeMatch ? typeMatch[1] : 'n'
      
      // Get value
      const valueMatch = inner.match(/<v>([\s\S]*?)<\/v>/)
      // Also check for inline strings
      const inlineMatch = inner.match(/<is>\s*<t[^>]*>([\s\S]*?)<\/t>\s*<\/is>/)
      
      let value = ''
      let dataType: CellData['type'] = 'number'
      
      if (inlineMatch) {
        value = inlineMatch[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
        dataType = 'string'
      } else if (valueMatch) {
        const raw = valueMatch[1]
        if (cellType === 's') {
          // Shared string reference
          const idx = parseInt(raw)
          value = sharedStrings[idx] || ''
          dataType = 'string'
        } else if (cellType === 'b') {
          value = raw === '1' ? 'TRUE' : 'FALSE'
          dataType = 'bool'
        } else {
          value = raw
          dataType = 'number'
        }
      }
      
      // Check for formula
      if (inner.includes('<f>') || inner.includes('<f ')) {
        dataType = 'formula'
      }
      
      if (value !== '') {
        cells.push({ ref, value, type: dataType })
      }
    }
    
    sheets.push({
      name: sheetNames[i] || `Sheet${i + 1}`,
      cells,
    })
  }
  
  return sheets
}

/**
 * Convert parsed xlsx data to readable text format
 * for AI processing and storage
 * LEGACY format: Row N: A1=val | B1=val
 */
export function xlsxToText(sheets: SheetData[]): string {
  const lines: string[] = []
  for (const sheet of sheets) {
    lines.push(`\n=== FEUILLE: ${sheet.name} ===`)
    
    // Group cells by row
    const rows: Record<number, CellData[]> = {}
    for (const cell of sheet.cells) {
      const rowNum = parseInt(cell.ref.replace(/[A-Z]/g, ''))
      if (!rows[rowNum]) rows[rowNum] = []
      rows[rowNum].push(cell)
    }
    
    // Output rows sorted
    const sortedRows = Object.entries(rows).sort(([a], [b]) => parseInt(a) - parseInt(b))
    for (const [rowNum, cells] of sortedRows) {
      const cellTexts = cells
        .sort((a, b) => a.ref.localeCompare(b.ref))
        .map(c => `${c.ref}=${c.value}`)
        .join(' | ')
      lines.push(`  Row ${rowNum}: ${cellTexts}`)
    }
  }
  return lines.join('\n')
}

/**
 * CORRECTION 1 UPGRADE — Convert parsed xlsx to Markdown table format
 * Produces output that is MUCH more readable for Claude AI:
 * 
 * ### FEUILLE: Plan Financier
 * | Poste          | Année 1    | Année 2    | Année 3    |
 * |----------------|------------|------------|------------|
 * | CA Total       | 59 130 000 | 85 000 000 | 120 000 000|
 * | Achats MP      | 35 000 000 | 48 000 000 | 65 000 000 |
 * 
 * This format lets Claude understand the TABLE STRUCTURE natively
 * instead of parsing "Row 5: A5=CA Total | B5=59130000"
 */
export function xlsxToMarkdownTables(sheets: SheetData[]): string {
  const output: string[] = []
  
  for (const sheet of sheets) {
    if (sheet.cells.length === 0) continue
    
    output.push(`\n### FEUILLE: ${sheet.name}`)
    
    // 1. Find grid bounds
    let maxRow = 0
    let maxCol = 0
    const colLetters = new Set<string>()
    
    for (const cell of sheet.cells) {
      const colLet = cell.ref.replace(/[0-9]/g, '')
      const rowNum = parseInt(cell.ref.replace(/[A-Z]/g, ''))
      colLetters.add(colLet)
      if (rowNum > maxRow) maxRow = rowNum
    }
    
    // Sort columns alphabetically (A, B, C, ... AA, AB...)
    const sortedCols = Array.from(colLetters).sort((a, b) => {
      if (a.length !== b.length) return a.length - b.length
      return a.localeCompare(b)
    })
    
    // Build column index
    const colIdx: Record<string, number> = {}
    sortedCols.forEach((c, i) => colIdx[c] = i)
    maxCol = sortedCols.length
    
    // 2. Build a 2D grid
    const grid: string[][] = []
    for (let r = 0; r < maxRow; r++) {
      grid.push(new Array(maxCol).fill(''))
    }
    
    for (const cell of sheet.cells) {
      const colLet = cell.ref.replace(/[0-9]/g, '')
      const rowNum = parseInt(cell.ref.replace(/[A-Z]/g, '')) - 1
      const ci = colIdx[colLet]
      if (ci !== undefined && rowNum >= 0 && rowNum < maxRow) {
        grid[rowNum][ci] = cell.value.trim()
      }
    }
    
    // 3. Skip entirely empty rows, find first meaningful row
    const nonEmptyRows: number[] = []
    for (let r = 0; r < grid.length; r++) {
      if (grid[r].some(v => v !== '')) nonEmptyRows.push(r)
    }
    
    if (nonEmptyRows.length === 0) continue
    
    // 4. Calculate column widths for alignment (cap at 30 chars)
    const colWidths = sortedCols.map((_, ci) => {
      let maxW = 3
      for (const ri of nonEmptyRows) {
        const len = grid[ri][ci].length
        if (len > maxW) maxW = Math.min(len, 30)
      }
      return maxW
    })
    
    // 5. Emit Markdown table — first non-empty row as header
    const firstRow = nonEmptyRows[0]
    
    // Header row
    const headerCells = sortedCols.map((_, ci) => {
      const val = grid[firstRow][ci].slice(0, 30)
      return ` ${val.padEnd(colWidths[ci])} `
    })
    output.push(`|${headerCells.join('|')}|`)
    
    // Separator
    const sepCells = colWidths.map(w => '-'.repeat(w + 2))
    output.push(`|${sepCells.join('|')}|`)
    
    // Data rows (skip empty)
    for (let i = 1; i < nonEmptyRows.length; i++) {
      const ri = nonEmptyRows[i]
      const rowCells = sortedCols.map((_, ci) => {
        const val = grid[ri][ci].slice(0, 30)
        return ` ${val.padEnd(colWidths[ci])} `
      })
      output.push(`|${rowCells.join('|')}|`)
    }
    
    output.push('') // blank line between sheets
  }
  
  return output.join('\n')
}

/**
 * Decode base64 to Uint8Array (works in Cloudflare Workers)
 */
export function b64ToUint8(b64: string): Uint8Array {
  const bin = atob(b64)
  const arr = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i)
  return arr
}
