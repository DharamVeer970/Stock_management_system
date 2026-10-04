"use client"
import Header from '@/components/Header'
import { useState, useEffect, useMemo, useRef } from 'react'

const LOW_STOCK = 10
const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 })
const num = new Intl.NumberFormat('en-IN')
const now = () => new Date().toLocaleTimeString('en-GB', { hour12: false })

const statusOf = (q) => {
  const n = parseInt(q) || 0
  if (n <= 0) return { key: 'out', label: 'out of stock', cls: 'border-rose-400/30 bg-rose-400/10 text-rose-300', bar: 'from-rose-500 to-rose-400' }
  if (n <= LOW_STOCK) return { key: 'low', label: 'low stock', cls: 'border-amber-400/30 bg-amber-400/10 text-amber-300', bar: 'from-amber-500 to-yellow-300' }
  return { key: 'in', label: 'in stock', cls: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300', bar: 'from-violet-500 via-fuchsia-500 to-cyan-400' }
}

const Spinner = ({ className = 'h-4 w-4' }) => (
  <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity=".2" strokeWidth="3" />
    <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
  </svg>
)

const StatCard = ({ label, value, hint, icon, accent, delay }) => (
  <div className="glass glow-border animate-fade-up p-5" style={{ animationDelay: delay }}>
    <div className="flex items-start justify-between">
      <span className="label !mb-0">{label}</span>
      <span className={`grid h-9 w-9 place-items-center rounded-lg ${accent}`}>{icon}</span>
    </div>
    <div className="mt-3 text-3xl font-bold tracking-tight text-white">{value}</div>
    <div className="mt-1 font-mono text-xs text-slate-500">{hint}</div>
  </div>
)

export default function Home() {
  const [productForm, setProductForm] = useState({})
  const [products, setProducts] = useState([])
  const [alert, setAlert] = useState(null) // { type: 'ok' | 'err', msg }
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingaction, setLoadingaction] = useState(false)
  const [adding, setAdding] = useState(false)
  const [syncing, setSyncing] = useState(true)
  const [dbOnline, setDbOnline] = useState(true)
  const [filter, setFilter] = useState('all')
  const [logs, setLogs] = useState([{ t: now(), level: 'sys', msg: 'StockPilot console booting…' }])

  const [dropdown, setDropdown] = useState([])
  const searchRef = useRef(null)
  const logEndRef = useRef(null)

  const log = (level, msg) => setLogs((l) => [...l.slice(-40), { t: now(), level, msg }])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/product')
      if (!response.ok) throw new Error('HTTP ' + response.status)
      let rjson = await response.json()
      setProducts(rjson.products || [])
      return rjson.products || []
    } catch (err) {
      setDbOnline(false)
      log('err', `sync failed → ${err.message}`)
      return []
    }
  }

  useEffect(() => {
    log('sys', 'StockPilot console ready');
    (async () => {
      const list = await fetchProducts()
      log('ok', `inventory synced · ${list.length} SKU(s) loaded`)
      setSyncing(false)
    })()

    // Ctrl/Cmd + K focuses the search "command palette"
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ block: 'nearest' })
  }, [logs])

  useEffect(() => {
    if (!alert) return
    const id = setTimeout(() => setAlert(null), 3500)
    return () => clearTimeout(id)
  }, [alert])

  const buttonAction = async (action, name, initialQuantity) => {
    const delta = action == "plus" ? 1 : -1
    const nextQty = parseInt(initialQuantity) + delta

    let newProducts = JSON.parse(JSON.stringify(products))
    let index = newProducts.findIndex((item) => item.name == name)
    if (index !== -1) newProducts[index].quantity = nextQty
    setProducts(newProducts)

    let newDropdown = JSON.parse(JSON.stringify(dropdown))
    let indexDrop = newDropdown.findIndex((item) => item.name == name)
    if (indexDrop !== -1) newDropdown[indexDrop].quantity = nextQty
    setDropdown(newDropdown)

    setLoadingaction(true)
    try {
      const response = await fetch('/api/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, name, initialQuantity })
      });
      if (!response.ok) throw new Error('HTTP ' + response.status)
      await response.json()
      log('ok', `${action === 'plus' ? 'restock' : 'dispatch'} "${name}" → qty ${nextQty}`)
    } catch (err) {
      log('err', `update "${name}" failed → ${err.message}`)
      setAlert({ type: 'err', msg: 'Could not update quantity.' })
    } finally {
      setLoadingaction(false)
    }
  }

  const addProduct = async (e) => {
    e.preventDefault();
    if (!productForm.name) {
      setAlert({ type: 'err', msg: 'Give your product a name first.' })
      return
    }
    setAdding(true)
    log('run', `add_product(${JSON.stringify(productForm)})`)
    try {
      const response = await fetch('/api/product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productForm)
      });

      // Check if the response indicates success
      if (response.ok) {
        setAlert({ type: 'ok', msg: `"${productForm.name}" has been added!` })
        log('ok', `product "${productForm.name}" created`)
        setProductForm({})
      } else {
        throw new Error('HTTP ' + response.status)
      }
    } catch (error) {
      setAlert({ type: 'err', msg: 'Error adding product. Is the database connected?' })
      log('err', `add_product failed → ${error.message}`)
    }
    await fetchProducts()
    setAdding(false)
  }

  const handleChange = (e) => {
    setProductForm({ ...productForm, [e.target.name]: e.target.value })
  }

  const onDropdownEdit = async (e) => {
    let value = e.target.value
    setQuery(value)
    if (value.length > 3) {
      setLoading(true)
      setDropdown([])
      try {
        const response = await fetch('/api/search?query=' + encodeURIComponent(value))
        if (!response.ok) throw new Error('HTTP ' + response.status)
        let rjson = await response.json()
        setDropdown(rjson.products || [])
        log('run', `search("${value}") → ${(rjson.products || []).length} match(es)`)
      } catch (err) {
        log('err', `search failed → ${err.message}`)
      }
      setLoading(false)
    }
    else {
      setDropdown([])
    }
  }

  const stats = useMemo(() => {
    const units = products.reduce((s, p) => s + (parseInt(p.quantity) || 0), 0)
    const value = products.reduce((s, p) => s + (parseInt(p.quantity) || 0) * (parseFloat(p.price) || 0), 0)
    const low = products.filter((p) => statusOf(p.quantity).key !== 'in').length
    const max = Math.max(1, ...products.map((p) => parseInt(p.quantity) || 0))
    return { units, value, low, max }
  }, [products])

  const visible = filter === 'all' ? products : products.filter((p) => statusOf(p.quantity).key === filter)

  const levelStyle = {
    sys: 'text-slate-500',
    run: 'text-cyan-300',
    ok: 'text-emerald-300',
    err: 'text-rose-300',
  }

  return (
    <>
      <Header dbOnline={dbOnline} />

      {/* Toast */}
      <div aria-live="polite" className="pointer-events-none fixed right-5 top-20 z-50">
        {alert && (
          <div className={`glass animate-fade-up flex items-center gap-3 px-4 py-3 text-sm ${alert.type === 'ok' ? 'text-emerald-200' : 'text-rose-200'}`}>
            <span className={`h-2 w-2 rounded-full ${alert.type === 'ok' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
            {alert.msg}
          </div>
        )}
      </div>

      <main className="mx-auto max-w-7xl px-5 pb-24">
        {/* Hero */}
        <section id="overview" className="scroll-mt-24 pt-14 pb-10">
          <span className="chip border-violet-400/30 bg-violet-500/10 text-violet-200 animate-fade-up">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
            real-time inventory · v2.0
          </span>
          <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-[1.1] tracking-tight text-white md:text-6xl animate-fade-up [animation-delay:80ms]">
            Your stock, organized with <span className="text-gradient">precision</span>.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-400 animate-fade-up [animation-delay:160ms]">
            Search catalogue items, adjust quantities, and monitor stock valuation from a centralized developer console.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-ink-900/70 px-4 py-2.5 font-mono text-sm text-slate-300 animate-fade-up [animation-delay:240ms]">
            <span className="text-fuchsia-400">❯</span>
            <span>{syncing ? 'syncing inventory' : `${products.length} products indexed · ready`}</span>
            <span className="inline-block h-4 w-2 animate-blink bg-cyan-300" />
          </div>
        </section>

        {/* Stats */}
        <section aria-label="Inventory statistics" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard delay="0ms" label="Products" value={num.format(products.length)} hint="unique SKUs tracked"
            accent="bg-violet-500/15 text-violet-300"
            icon={<svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0v10l-8 4m8-14l-8 4m0 10L4 17V7m8 14V11M4 7l8 4" /></svg>} />
          <StatCard delay="80ms" label="Units" value={num.format(stats.units)} hint="total items on hand"
            accent="bg-cyan-500/15 text-cyan-300"
            icon={<svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18M7 15l4-4 3 3 5-6" /></svg>} />
          <StatCard delay="160ms" label="Value" value={inr.format(stats.value)} hint="qty × price"
            accent="bg-fuchsia-500/15 text-fuchsia-300"
            icon={<svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 4h12M6 9h12M9 4c4 0 6 2 6 5s-2 5-6 5H6l8 7" /></svg>} />
          <StatCard delay="240ms" label="Alerts" value={num.format(stats.low)} hint={`items ≤ ${LOW_STOCK} units`}
            accent="bg-amber-500/15 text-amber-300"
            icon={<svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" /></svg>} />
        </section>

        {/* Search: command palette */}
        <section id="search" className="relative z-20 scroll-mt-24 mt-10">
          <div className="glass glow-border p-5 md:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Search a Product</h2>
              <span className="font-mono text-xs text-slate-500">type 4+ chars · adjust inline</span>
            </div>
            <div className="relative">
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-ink-900/70 px-4 transition focus-within:border-violet-400/60 focus-within:ring-4 focus-within:ring-violet-500/20">
                <svg className="h-5 w-5 shrink-0 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path strokeLinecap="round" d="M20 20l-3.5-3.5" /></svg>
                <label htmlFor="searchProduct" className="sr-only">Search products</label>
                <input
                  ref={searchRef}
                  onBlur={() => { setDropdown([]) }}
                  onChange={onDropdownEdit}
                  value={query}
                  type="text"
                  id="searchProduct"
                  autoComplete="off"
                  className="flex-1 bg-transparent py-3.5 text-slate-100 placeholder-slate-500 outline-none"
                  placeholder="Search products by name or SKU…"
                />
                {loading ? <Spinner className="h-5 w-5 text-violet-300" /> : (
                  <kbd className="hidden rounded-md border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[11px] text-slate-400 sm:inline-block">Ctrl K</kbd>
                )}
              </div>

              {dropdown.length > 0 && (
                <ul
                  // keep input focused so clicks on +/- register before blur closes the list
                  onMouseDown={(e) => e.preventDefault()}
                  className="absolute left-0 right-0 z-30 mt-2 max-h-80 overflow-auto rounded-xl border border-white/10 bg-ink-900/95 p-1.5 shadow-2xl shadow-black/60 backdrop-blur-xl animate-fade-up"
                >
                  {dropdown.map(item => {
                    const s = statusOf(item.quantity)
                    return (
                      <li key={item.name} className="flex items-center justify-between gap-4 rounded-lg px-3 py-2.5 transition hover:bg-white/5">
                        <div className="min-w-0">
                          <div className="truncate font-medium text-slate-100">{item.name}</div>
                          <div className="font-mono text-xs text-slate-500">{inr.format(parseFloat(item.price) || 0)} · <span className={s.cls.split(' ').pop()}>{s.label}</span></div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button aria-label={`Decrease ${item.name}`} onClick={() => { buttonAction("minus", item.name, item.quantity) }} disabled={loadingaction} className="btn-icon">−</button>
                          <span className="min-w-[3ch] text-center font-mono text-sm text-white">{item.quantity}</span>
                          <button aria-label={`Increase ${item.name}`} onClick={() => { buttonAction("plus", item.name, item.quantity) }} disabled={loadingaction} className="btn-icon">+</button>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </div>
        </section>

        {/* Add product + agent log */}
        <section className="mt-6 grid gap-6 lg:grid-cols-5">
          <div id="add" className="glass glow-border scroll-mt-24 p-5 md:p-6 lg:col-span-3">
            <div className="mb-5 flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand text-white shadow-glow">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" d="M12 5v14M5 12h14" /></svg>
              </span>
              <div>
                <h2 className="text-xl font-semibold text-white">Add a Product</h2>
                <p className="text-sm text-slate-500">Register a new SKU in the inventory.</p>
              </div>
            </div>
            <form onSubmit={addProduct} className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor='productName' className='label'>Product Name</label>
                <input value={productForm?.name || ""} name='name' onChange={handleChange} type="text" id="productName" placeholder="e.g. Neural Keyboard X1" className="field" required />
              </div>

              <div>
                <label htmlFor='quantity' className='label'>Quantity</label>
                <input value={productForm?.quantity || ""} name='quantity' onChange={handleChange} type="number" min="0" id="quantity" placeholder="0" className="field font-mono" />
              </div>

              <div>
                <label htmlFor='price' className='label'>Price (₹)</label>
                <input value={productForm?.price || ""} name='price' onChange={handleChange} type="number" min="0" step="any" id="price" placeholder="0.00" className="field font-mono" />
              </div>

              <div className="flex items-center justify-between gap-4 sm:col-span-2">
                <p className="font-mono text-xs text-slate-500">
                  {productForm.quantity && productForm.price
                    ? <>est. value <span className="text-slate-300">{inr.format((parseInt(productForm.quantity) || 0) * (parseFloat(productForm.price) || 0))}</span></>
                    : 'fill in quantity & price to preview value'}
                </p>
                <button type="submit" disabled={adding} className="btn-primary">
                  {adding ? <Spinner /> : (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  )}
                  {adding ? 'Adding…' : 'Add a Product'}
                </button>
              </div>
            </form>
          </div>

          {/* Terminal-style activity log */}
          <div className="glass flex flex-col overflow-hidden lg:col-span-2">
            <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.02] px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-rose-400/80" />
              <span className="h-3 w-3 rounded-full bg-amber-400/80" />
              <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
              <span className="ml-3 font-mono text-xs text-slate-400">activity.log</span>
              <span className="ml-auto font-mono text-[10px] uppercase tracking-widest text-slate-500">live</span>
            </div>
            <div className="h-72 flex-1 overflow-auto p-4 font-mono text-[12.5px] leading-relaxed lg:h-auto lg:max-h-[22rem]" role="log" aria-label="Inventory activity log">
              {logs.map((l, i) => (
                <div key={i} className="flex gap-3">
                  <span className="shrink-0 text-slate-600">{l.t}</span>
                  <span className={`shrink-0 w-8 ${levelStyle[l.level]}`}>[{l.level}]</span>
                  <span className="break-all text-slate-300">{l.msg}</span>
                </div>
              ))}
              <div className="flex gap-3 text-slate-500">
                <span className="text-fuchsia-400">❯</span>
                <span className="inline-block h-4 w-2 animate-blink bg-slate-400" />
              </div>
              <div ref={logEndRef} />
            </div>
          </div>
        </section>

        {/* Current stock */}
        <section id="stock" className="glass scroll-mt-24 mt-6 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 p-5 md:px-6">
            <div>
              <h2 className="text-xl font-semibold text-white">Current Stock</h2>
              <p className="text-sm text-slate-500">{visible.length} of {products.length} products</p>
            </div>
            <div role="tablist" aria-label="Filter stock" className="flex gap-1 rounded-xl border border-white/10 bg-ink-900/70 p-1">
              {[['all', 'All'], ['in', 'In stock'], ['low', 'Low'], ['out', 'Out']].map(([k, label]) => (
                <button
                  key={k}
                  role="tab"
                  aria-selected={filter === k}
                  onClick={() => setFilter(k)}
                  className={`rounded-lg px-3 py-1.5 text-sm transition ${filter === k ? 'bg-brand text-white shadow-glow' : 'text-slate-400 hover:text-white'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className='w-full text-left text-sm'>
              <thead>
                <tr className="font-mono text-[11px] uppercase tracking-[0.15em] text-slate-500">
                  <th className='px-6 py-3 font-medium'>Product Name</th>
                  <th className='px-6 py-3 font-medium'>Quantity</th>
                  <th className='px-6 py-3 font-medium'>Price</th>
                  <th className='px-6 py-3 font-medium'>Status</th>
                  <th className='px-6 py-3 text-right font-medium'>Adjust</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {syncing ? (
                  [0, 1, 2].map((i) => (
                    <tr key={i}>
                      <td colSpan="5" className="px-6 py-4">
                        <div className="h-5 animate-pulse rounded-md bg-white/5" />
                      </td>
                    </tr>
                  ))
                ) : visible && visible.length > 0 ? (
                  visible.map(product => {
                    const s = statusOf(product.quantity)
                    const pct = Math.max(4, Math.min(100, ((parseInt(product.quantity) || 0) / stats.max) * 100))
                    return (
                      <tr key={product.name} className="group transition hover:bg-white/[0.03]">
                        <td className='px-6 py-4'>
                          <div className="flex items-center gap-3">
                            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-violet-500/30 to-cyan-400/20 font-mono text-sm font-semibold uppercase text-violet-100 ring-1 ring-white/10">
                              {String(product.name || '?').slice(0, 2)}
                            </span>
                            <span className="font-medium text-slate-100">{product.name}</span>
                          </div>
                        </td>
                        <td className='px-6 py-4'>
                          <div className="flex items-center gap-3">
                            <span className="w-10 font-mono text-slate-200">{product.quantity}</span>
                            <div className="h-1.5 w-28 overflow-hidden rounded-full bg-white/5">
                              <div className={`h-full rounded-full bg-gradient-to-r ${s.bar} transition-all duration-500`} style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className='px-6 py-4 font-mono text-slate-300'>{inr.format(parseFloat(product.price) || 0)}</td>
                        <td className='px-6 py-4'><span className={`chip ${s.cls}`}>{s.label}</span></td>
                        <td className='px-6 py-4'>
                          <div className="flex justify-end gap-2 opacity-60 transition group-hover:opacity-100">
                            <button aria-label={`Decrease ${product.name}`} onClick={() => buttonAction("minus", product.name, product.quantity)} disabled={loadingaction} className="btn-icon">−</button>
                            <button aria-label={`Increase ${product.name}`} onClick={() => buttonAction("plus", product.name, product.quantity)} disabled={loadingaction} className="btn-icon">+</button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-16 text-center">
                      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-white/10 bg-white/5 text-slate-400">
                        <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0v10l-8 4m8-14l-8 4m0 10L4 17V7m8 14V11M4 7l8 4" /></svg>
                      </div>
                      <p className="mt-4 font-medium text-slate-300">No products available</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {products.length ? 'Nothing matches this filter.' : <>Add your first product above to <a href="#add" className="text-violet-300 underline-offset-4 hover:underline">get started</a>.</>}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <footer className="mt-12 text-center font-mono text-xs text-slate-600">
          built with next.js · tailwind · mongodb — <span className="text-gradient">StockPilot</span>
        </footer>
      </main>
    </>
  )
}
