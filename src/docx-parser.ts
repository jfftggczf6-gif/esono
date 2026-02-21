// ═══════════════════════════════════════════════════════════════
// DOCX PARSER — Parse .docx files using fflate (no Node.js APIs)
// A .docx file is a ZIP containing XML files
// Main content is in word/document.xml
// ═══════════════════════════════════════════════════════════════

import { unzipSync } from 'fflate'

/**
 * Parse a .docx file from a Uint8Array (binary content)
 * Extracts readable text from word/document.xml
 * Returns plain text with paragraph separation
 */
export function parseDocx(data: Uint8Array): string {
  const files = unzipSync(data)
  const decoder = new TextDecoder('utf-8')
  
  const sections: string[] = []
  
  // 1. Extract text from word/document.xml (main content)
  const docPath = 'word/document.xml'
  if (files[docPath]) {
    const docXml = decoder.decode(files[docPath])
    const text = extractTextFromWordXml(docXml)
    if (text.trim()) {
      sections.push(text)
    }
  }
  
  // 2. Also try headers/footers for completeness
  for (const [path, content] of Object.entries(files)) {
    if ((path.startsWith('word/header') || path.startsWith('word/footer')) && path.endsWith('.xml')) {
      const xml = decoder.decode(content as Uint8Array)
      const text = extractTextFromWordXml(xml)
      if (text.trim() && text.trim().length > 5) {
        sections.push(`[${path.includes('header') ? 'En-tête' : 'Pied de page'}] ${text.trim()}`)
      }
    }
  }
  
  return sections.join('\n\n')
}

/**
 * Extract readable text from Word XML content
 * Handles paragraphs (<w:p>), runs (<w:r>), text (<w:t>),
 * tables (<w:tbl>), and basic formatting
 */
function extractTextFromWordXml(xml: string): string {
  const lines: string[] = []
  
  // Unescape XML entities first
  const unescape = (s: string) => s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n)))
  
  // Strategy: Extract paragraphs (w:p elements) and collect text runs
  // We handle tables specially to preserve structure
  
  // First, check if there are tables
  const tableRegex = /<w:tbl\b[\s\S]*?<\/w:tbl>/g
  const tablePositions: Array<{start: number, end: number, text: string}> = []
  let tableMatch
  while ((tableMatch = tableRegex.exec(xml)) !== null) {
    const tableText = extractTableText(tableMatch[0], unescape)
    tablePositions.push({
      start: tableMatch.index,
      end: tableMatch.index + tableMatch[0].length,
      text: tableText
    })
  }
  
  // Now process the full document paragraph by paragraph
  // Split by paragraph markers
  const paraRegex = /<w:p\b[^>]*>([\s\S]*?)<\/w:p>/g
  let paraMatch
  let lastEnd = 0
  
  while ((paraMatch = paraRegex.exec(xml)) !== null) {
    const paraStart = paraMatch.index
    
    // Check if this paragraph is inside a table
    const inTable = tablePositions.some(t => paraStart >= t.start && paraStart < t.end)
    if (inTable) continue // Skip paragraphs inside tables, handled separately
    
    // Extract text from this paragraph
    const paraContent = paraMatch[1]
    const textParts: string[] = []
    
    // Find all <w:t> elements in this paragraph
    const tRegex = /<w:t[^>]*>([\s\S]*?)<\/w:t>/g
    let tMatch
    while ((tMatch = tRegex.exec(paraContent)) !== null) {
      textParts.push(unescape(tMatch[1]))
    }
    
    // Check for tab characters <w:tab/>
    if (paraContent.includes('<w:tab/>') || paraContent.includes('<w:tab />')) {
      // Join with tabs
      const fullText = textParts.join('')
      if (fullText.trim()) {
        lines.push(fullText)
      }
    } else {
      const fullText = textParts.join('')
      if (fullText.trim()) {
        lines.push(fullText)
      }
    }
    
    // Check if paragraph has bullet/numbering
    if (paraContent.includes('<w:numPr>') || paraContent.includes('<w:ilvl')) {
      // Indent the last line as a bullet point
      if (lines.length > 0) {
        const lastLine = lines[lines.length - 1]
        if (!lastLine.startsWith('  •') && !lastLine.startsWith('  -')) {
          lines[lines.length - 1] = `  • ${lastLine}`
        }
      }
    }
  }
  
  // Insert tables at their relative positions
  // Since we collected paragraphs sequentially, approximate table placement
  // For simplicity, append tables at the end with markers
  for (const table of tablePositions) {
    if (table.text.trim()) {
      lines.push('')
      lines.push('[TABLEAU]')
      lines.push(table.text)
      lines.push('[/TABLEAU]')
    }
  }
  
  return lines.join('\n')
}

/**
 * Extract text from a Word table (<w:tbl>)
 * Preserves row/column structure using Markdown-like table format
 */
function extractTableText(tableXml: string, unescape: (s: string) => string): string {
  const rows: string[][] = []
  
  // Find all rows
  const rowRegex = /<w:tr\b[\s\S]*?<\/w:tr>/g
  let rowMatch
  while ((rowMatch = rowRegex.exec(tableXml)) !== null) {
    const cells: string[] = []
    
    // Find all cells in this row
    const cellRegex = /<w:tc\b[\s\S]*?<\/w:tc>/g
    let cellMatch
    while ((cellMatch = cellRegex.exec(rowMatch[0])) !== null) {
      const cellContent = cellMatch[0]
      const textParts: string[] = []
      
      // Extract text
      const tRegex = /<w:t[^>]*>([\s\S]*?)<\/w:t>/g
      let tMatch
      while ((tMatch = tRegex.exec(cellContent)) !== null) {
        textParts.push(unescape(tMatch[1]))
      }
      
      cells.push(textParts.join(' ').trim())
    }
    
    if (cells.length > 0) {
      rows.push(cells)
    }
  }
  
  if (rows.length === 0) return ''
  
  // Format as Markdown table
  const maxCols = Math.max(...rows.map(r => r.length))
  const colWidths: number[] = new Array(maxCols).fill(3)
  
  for (const row of rows) {
    for (let i = 0; i < row.length; i++) {
      const len = row[i].length
      if (len > colWidths[i]) colWidths[i] = Math.min(len, 40)
    }
  }
  
  const formatRow = (cells: string[]) => {
    const formatted = []
    for (let i = 0; i < maxCols; i++) {
      const val = (cells[i] || '').slice(0, 40)
      formatted.push(` ${val.padEnd(colWidths[i])} `)
    }
    return `|${formatted.join('|')}|`
  }
  
  const lines: string[] = []
  lines.push(formatRow(rows[0]))
  lines.push(`|${colWidths.map(w => '-'.repeat(w + 2)).join('|')}|`)
  for (let i = 1; i < rows.length; i++) {
    lines.push(formatRow(rows[i]))
  }
  
  return lines.join('\n')
}

/**
 * Parse a .docx and return structured text with Markdown formatting
 * Suitable for Claude AI processing
 */
export function docxToMarkdown(data: Uint8Array): string {
  const text = parseDocx(data)
  // Add document header
  return `---DOCUMENT_TEXT---\n${text}`
}
