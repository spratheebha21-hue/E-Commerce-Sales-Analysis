import { useEffect, useMemo, useState } from 'react'
import './App.css'

const API_URL = 'http://localhost:8000/api/analytics'

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value || 0)
}

function App() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        const response = await fetch(API_URL)

        if (!response.ok) {
          throw new Error('Unable to load analytics data from the API.')
        }

        const result = await response.json()
        setData(result)
      } catch (fetchError) {
        setError(fetchError.message)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  const summaryCards = useMemo(() => {
    if (!data?.summary) return []

    return [
      { label: 'Total Revenue', value: formatCurrency(data.summary.total_revenue) },
      { label: 'Total Orders', value: data.summary.total_orders.toLocaleString() },
      { label: 'Avg. Order Value', value: formatCurrency(data.summary.avg_order_value) },
      { label: 'Top Category', value: data.summary.top_category },
    ]
  }, [data])

  if (loading) {
    return <div className="page-shell loading-state">Loading e-commerce analytics...</div>
  }

  if (error) {
    return <div className="page-shell error-state">{error}</div>
  }

  const maxMonthlyRevenue = Math.max(...(data?.by_month?.map((row) => row.revenue) || [1]))
  const maxCategoryRevenue = Math.max(...(data?.by_category?.map((row) => row.revenue) || [1]))

  return (
    <div className="page-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Performance Dashboard</p>
          <h1>E-commerce Sales Analysis</h1>
        </div>
        <div className="topbar-badge">Live analytics</div>
      </header>

      <section className="stats-grid">
        {summaryCards.map((card) => (
          <article key={card.label} className="stat-card">
            <span>{card.label}</span>
            <strong>{card.value}</strong>
          </article>
        ))}
      </section>

      <section className="content-grid">
        <article className="panel">
          <div className="panel-header">
            <h2>Monthly Revenue Trend</h2>
          </div>
          <div className="chart-list">
            {data.by_month.map((row) => (
              <div key={row.month} className="bar-row">
                <span>{row.month}</span>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{ width: `${(row.revenue / maxMonthlyRevenue) * 100}%` }}
                  />
                </div>
                <strong>{formatCurrency(row.revenue)}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <div className="panel-header">
            <h2>Sales by Category</h2>
          </div>
          <div className="stack-list">
            {data.by_category.map((row) => (
              <div key={row.category} className="stack-item">
                <div className="stack-meta">
                  <span>{row.category}</span>
                  <strong>{formatCurrency(row.revenue)}</strong>
                </div>
                <div className="bar-track">
                  <div
                    className="bar-fill secondary"
                    style={{ width: `${(row.revenue / maxCategoryRevenue) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="content-grid bottom-grid">
        <article className="panel">
          <div className="panel-header">
            <h2>Regional Performance</h2>
          </div>
          <ul className="mini-list">
            {data.by_region.map((row) => (
              <li key={row.region}>
                <span>{row.region}</span>
                <strong>{formatCurrency(row.revenue)}</strong>
              </li>
            ))}
          </ul>
        </article>

        <article className="panel">
          <div className="panel-header">
            <h2>Top Products</h2>
          </div>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Revenue</th>
                <th>Units</th>
              </tr>
            </thead>
            <tbody>
              {data.top_products.map((row) => (
                <tr key={row.product}>
                  <td>{row.product}</td>
                  <td>{formatCurrency(row.revenue)}</td>
                  <td>{row.units}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
      </section>
    </div>
  )
}

export default App
