import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabaseClient'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'

const REQUIRED_COLUMNS = ['name', 'category', 'color', 'quantity', 'selling_price', 'cost_price', 'status']

const headerStyle = {
  padding: '1rem',
  background: 'var(--primary)',
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  position: 'sticky',
  top: 0,
  zIndex: 10
}

const cardStyle = {
  background: 'white',
  border: '1px solid var(--border)',
  borderRadius: '12px',
  padding: '1.2rem',
  marginBottom: '1rem'
}

export default function AdminImportExport() {
  const navigate = useNavigate()
  const fileRef = useRef()
  const [preview, setPreview] = useState([])
  const [errors, setErrors] = useState([])
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState(null)

  // --- EXPORT ---
  async function handleExport() {
    const { data, error } = await supabase
      .from('products')
      .select('name, category, color, quantity, selling_price, cost_price, status')
      .order('created_at', { ascending: false })

    if (error) { alert('Export failed: ' + error.message); return }

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Products')
    XLSX.writeFile(wb, 'gshop-products.xlsx')
  }

  // --- DOWNLOAD TEMPLATE ---
  function downloadTemplate() {
    const template = [
      { name: '2-organza silk', category: 'silk', color: 'Brown with green border', quantity: 2, selling_price: 1200, cost_price: 850, status: 'available' },
      { name: '3-silk', category: 'silk', color: 'Yellow', quantity: 1, selling_price: 1250, cost_price: 850, status: 'available' },
      { name: '14-cotton', category: 'cotton', color: 'Red', quantity: 1, selling_price: 1800, cost_price: 1050, status: 'available' },
    ]
    const ws = XLSX.utils.json_to_sheet(template)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Products')
    XLSX.writeFile(wb, 'gshop-template.xlsx')
  }

  // --- PARSE FILE ---
  function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return
    setPreview([])
    setErrors([])
    setResult(null)

    const ext = file.name.split('.').pop().toLowerCase()

    if (ext === 'csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => processRows(results.data)
      })
    } else if (ext === 'xlsx' || ext === 'xls') {
      const reader = new FileReader()
      reader.onload = (e) => {
        const wb = XLSX.read(e.target.result, { type: 'binary' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const data = XLSX.utils.sheet_to_json(ws)
        processRows(data)
      }
      reader.readAsBinaryString(file)
    } else {
      alert('Please upload a .csv or .xlsx file')
    }
  }

  function processRows(rows) {
    const errs = []

    // Check columns
    if (rows.length === 0) { errs.push('File is empty'); setErrors(errs); return }
    const cols = Object.keys(rows[0]).map(c => c.trim().toLowerCase())
    const missing = REQUIRED_COLUMNS.filter(r => !cols.includes(r))
    if (missing.length > 0) {
      errs.push(`Missing columns: ${missing.join(', ')}`)
      setErrors(errs)
      return
    }

    // Validate rows
    const cleaned = rows.map((row, i) => {
      const r = Object.fromEntries(Object.entries(row).map(([k, v]) => [k.trim().toLowerCase(), String(v).trim()]))
      if (!r.name) errs.push(`Row ${i + 2}: name is required`)
      if (!['available', 'sold'].includes(r.status?.toLowerCase())) errs.push(`Row ${i + 2}: status must be "available" or "sold"`)
      if (isNaN(parseFloat(r.selling_price))) errs.push(`Row ${i + 2}: selling_price must be a number`)
      if (isNaN(parseFloat(r.cost_price))) errs.push(`Row ${i + 2}: cost_price must be a number`)
      return {
        name: r.name,
        category: r.category || '',
        color: r.color || '',
        quantity: parseInt(r.quantity) || 1,
        selling_price: parseFloat(r.selling_price) || 0,
        cost_price: parseFloat(r.cost_price) || 0,
        status: r.status?.toLowerCase() || 'available'
      }
    })

    setErrors(errs)
    if (errs.length === 0) setPreview(cleaned)
  }

  // --- IMPORT ---
  async function handleImport() {
    setImporting(true)
    const { error } = await supabase.from('products').insert(preview)
    if (error) {
      alert('Import failed: ' + error.message)
    } else {
      setResult(`✅ Successfully imported ${preview.length} products!`)
      setPreview([])
      if (fileRef.current) fileRef.current.value = ''
    }
    setImporting(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: 'var(--font-body)' }}>

      {/* Header */}
      <div style={headerStyle}>
        <button onClick={() => navigate('/admin')} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', width: '34px', height: '34px', borderRadius: '50%', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>←</button>
        <h2 style={{ fontFamily: 'var(--font-display)', color: 'white', fontSize: '1.2rem' }}>Import / Export</h2>
      </div>

      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '1.2rem' }}>

        {/* Export section */}
        <div style={cardStyle}>
          <h3 style={{ marginBottom: '0.3rem', color: 'var(--text)' }}>Export Products</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1rem' }}>Download all your current products as an Excel file.</p>
          <button onClick={handleExport} style={{ padding: '0.7rem 1.2rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>
            ⬇ Export to Excel
          </button>
        </div>

        {/* Template section */}
        <div style={cardStyle}>
          <h3 style={{ marginBottom: '0.3rem', color: 'var(--text)' }}>Download Template</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1rem' }}>
            Download the Excel template, fill it in, then upload below. Do not change column names.
          </p>
          <button onClick={downloadTemplate} style={{ padding: '0.7rem 1.2rem', background: 'white', color: 'var(--primary)', border: '2px solid var(--primary)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>
            ⬇ Download Template
          </button>
        </div>

        {/* Import section */}
        <div style={cardStyle}>
          <h3 style={{ marginBottom: '0.3rem', color: 'var(--text)' }}>Import Products</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1rem' }}>
            Upload a filled template (.xlsx or .csv). Images can be added later via Edit.
          </p>

          <input
            ref={fileRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFile}
            style={{ marginBottom: '1rem', display: 'block', fontSize: '0.9rem', color: 'var(--text)' }}
          />

          {/* Errors */}
          {errors.length > 0 && (
            <div style={{ background: '#FFF0F0', border: '1px solid #ffcccc', borderRadius: '8px', padding: '0.8rem', marginBottom: '1rem' }}>
              <p style={{ color: '#C62828', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.9rem' }}>Please fix these errors:</p>
              {errors.map((e, i) => <p key={i} style={{ color: '#C62828', fontSize: '0.85rem', marginBottom: '0.2rem' }}>• {e}</p>)}
            </div>
          )}

          {/* Success */}
          {result && (
            <div style={{ background: '#E8F5E9', border: '1px solid #a5d6a7', borderRadius: '8px', padding: '0.8rem', marginBottom: '1rem' }}>
              <p style={{ color: '#2E7D32', fontWeight: 600 }}>{result}</p>
            </div>
          )}

          {/* Preview table */}
          {preview.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text)' }}>Preview — {preview.length} rows ready to import:</p>
              <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--primary)', color: 'white' }}>
                      {['Name', 'Category', 'Color', 'Qty', 'Selling ₹', 'Cost ₹', 'Status'].map(h => (
                        <th key={h} style={{ padding: '0.5rem 0.7rem', textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.slice(0, 5).map((row, i) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? 'white' : '#FAF6F2' }}>
                        <td style={{ padding: '0.5rem 0.7rem' }}>{row.name}</td>
                        <td style={{ padding: '0.5rem 0.7rem' }}>{row.category}</td>
                        <td style={{ padding: '0.5rem 0.7rem' }}>{row.color}</td>
                        <td style={{ padding: '0.5rem 0.7rem' }}>{row.quantity}</td>
                        <td style={{ padding: '0.5rem 0.7rem' }}>{row.selling_price}</td>
                        <td style={{ padding: '0.5rem 0.7rem' }}>{row.cost_price}</td>
                        <td style={{ padding: '0.5rem 0.7rem' }}>
                          <span style={{ color: row.status === 'available' ? '#2E7D32' : '#C62828', fontWeight: 600 }}>{row.status}</span>
                        </td>
                      </tr>
                    ))}
                    {preview.length > 5 && (
                      <tr>
                        <td colSpan={7} style={{ padding: '0.5rem 0.7rem', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center' }}>
                          ...and {preview.length - 5} more rows
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <button
                onClick={handleImport}
                disabled={importing}
                style={{ marginTop: '0.8rem', width: '100%', padding: '0.9rem', background: '#2E7D32', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.95rem', opacity: importing ? 0.7 : 1 }}
              >
                {importing ? 'Importing...' : `⬆ Import ${preview.length} Products`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}