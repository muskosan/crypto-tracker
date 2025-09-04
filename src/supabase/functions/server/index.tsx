import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { logger } from 'npm:hono/logger'
import { createClient } from 'npm:@supabase/supabase-js@2'
import * as kv from './kv_store.tsx'

const app = new Hono()

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

app.use('*', logger(console.log))
app.use('*', cors({
  origin: '*',
  allowHeaders: ['*'],
  allowMethods: ['*'],
}))

// Auth Routes
app.post('/make-server-9a7f9b62/auth/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json()
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    })

    if (error) {
      console.log(`Sign up error: ${error.message}`)
      return c.json({ error: error.message }, 400)
    }

    // Initialize user portfolio
    if (data.user) {
      await kv.set(`portfolio:${data.user.id}`, {
        holdings: [],
        watchlist: [],
        totalValue: 0,
        createdAt: new Date().toISOString()
      })
    }

    return c.json({ user: data.user })
  } catch (error) {
    console.log(`Sign up server error: ${error}`)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Portfolio Routes
app.get('/make-server-9a7f9b62/portfolio/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    
    // Verify user authorization
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    if (!user || user.id !== userId) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const portfolio = await kv.get(`portfolio:${userId}`)
    if (!portfolio) {
      // Create default portfolio if doesn't exist
      const defaultPortfolio = {
        holdings: [],
        watchlist: [],
        totalValue: 0,
        createdAt: new Date().toISOString()
      }
      await kv.set(`portfolio:${userId}`, defaultPortfolio)
      return c.json(defaultPortfolio)
    }

    return c.json(portfolio)
  } catch (error) {
    console.log(`Portfolio fetch error: ${error}`)
    return c.json({ error: 'Failed to fetch portfolio' }, 500)
  }
})

app.post('/make-server-9a7f9b62/portfolio/:userId/holdings', async (c) => {
  try {
    const userId = c.req.param('userId')
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { coinId, amount, price } = await c.req.json()
    
    // Verify user authorization
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    if (!user || user.id !== userId) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    let portfolio = await kv.get(`portfolio:${userId}`)
    if (!portfolio) {
      portfolio = { holdings: [], watchlist: [], totalValue: 0, createdAt: new Date().toISOString() }
    }

    // Add or update holding
    const existingHoldingIndex = portfolio.holdings.findIndex((h: any) => h.coinId === coinId)
    
    if (existingHoldingIndex >= 0) {
      // Update existing holding
      const existingHolding = portfolio.holdings[existingHoldingIndex]
      const newAmount = existingHolding.amount + amount
      const newAvgPrice = ((existingHolding.amount * existingHolding.avgPrice) + (amount * price)) / newAmount
      
      portfolio.holdings[existingHoldingIndex] = {
        ...existingHolding,
        amount: newAmount,
        avgPrice: newAvgPrice,
        lastUpdated: new Date().toISOString()
      }
    } else {
      // Add new holding
      portfolio.holdings.push({
        coinId,
        amount,
        avgPrice: price,
        purchaseDate: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      })
    }

    await kv.set(`portfolio:${userId}`, portfolio)
    return c.json(portfolio)
  } catch (error) {
    console.log(`Add holding error: ${error}`)
    return c.json({ error: 'Failed to add holding' }, 500)
  }
})

app.post('/make-server-9a7f9b62/portfolio/:userId/watchlist', async (c) => {
  try {
    const userId = c.req.param('userId')
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { coinId, action } = await c.req.json() // action: 'add' or 'remove'
    
    // Verify user authorization
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    if (!user || user.id !== userId) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    let portfolio = await kv.get(`portfolio:${userId}`)
    if (!portfolio) {
      portfolio = { holdings: [], watchlist: [], totalValue: 0, createdAt: new Date().toISOString() }
    }

    if (action === 'add') {
      if (!portfolio.watchlist.includes(coinId)) {
        portfolio.watchlist.push(coinId)
      }
    } else if (action === 'remove') {
      portfolio.watchlist = portfolio.watchlist.filter((id: string) => id !== coinId)
    }

    await kv.set(`portfolio:${userId}`, portfolio)
    return c.json(portfolio)
  } catch (error) {
    console.log(`Watchlist update error: ${error}`)
    return c.json({ error: 'Failed to update watchlist' }, 500)
  }
})

// Trading simulation route
app.post('/make-server-9a7f9b62/trade', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const { userId, coinId, type, amount, price } = await c.req.json() // type: 'buy' or 'sell'
    
    // Verify user authorization
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    if (!user || user.id !== userId) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    let portfolio = await kv.get(`portfolio:${userId}`)
    if (!portfolio) {
      portfolio = { holdings: [], watchlist: [], totalValue: 0, createdAt: new Date().toISOString() }
    }

    const existingHoldingIndex = portfolio.holdings.findIndex((h: any) => h.coinId === coinId)
    
    if (type === 'buy') {
      if (existingHoldingIndex >= 0) {
        const existingHolding = portfolio.holdings[existingHoldingIndex]
        const newAmount = existingHolding.amount + amount
        const newAvgPrice = ((existingHolding.amount * existingHolding.avgPrice) + (amount * price)) / newAmount
        
        portfolio.holdings[existingHoldingIndex] = {
          ...existingHolding,
          amount: newAmount,
          avgPrice: newAvgPrice,
          lastUpdated: new Date().toISOString()
        }
      } else {
        portfolio.holdings.push({
          coinId,
          amount,
          avgPrice: price,
          purchaseDate: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        })
      }
    } else if (type === 'sell') {
      if (existingHoldingIndex >= 0) {
        const existingHolding = portfolio.holdings[existingHoldingIndex]
        if (existingHolding.amount >= amount) {
          const newAmount = existingHolding.amount - amount
          if (newAmount > 0) {
            portfolio.holdings[existingHoldingIndex] = {
              ...existingHolding,
              amount: newAmount,
              lastUpdated: new Date().toISOString()
            }
          } else {
            portfolio.holdings.splice(existingHoldingIndex, 1)
          }
        } else {
          return c.json({ error: 'Insufficient holdings' }, 400)
        }
      } else {
        return c.json({ error: 'No holdings found for this coin' }, 400)
      }
    }

    // Record trade history
    const tradeId = `trade:${userId}:${Date.now()}`
    await kv.set(tradeId, {
      userId,
      coinId,
      type,
      amount,
      price,
      timestamp: new Date().toISOString()
    })

    await kv.set(`portfolio:${userId}`, portfolio)
    return c.json({ success: true, portfolio })
  } catch (error) {
    console.log(`Trade error: ${error}`)
    return c.json({ error: 'Failed to execute trade' }, 500)
  }
})

// Get trade history
app.get('/make-server-9a7f9b62/trades/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    
    // Verify user authorization
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    if (!user || user.id !== userId) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const trades = await kv.getByPrefix(`trade:${userId}:`)
    return c.json(trades || [])
  } catch (error) {
    console.log(`Trade history fetch error: ${error}`)
    return c.json({ error: 'Failed to fetch trade history' }, 500)
  }
})

// CoinGecko API Proxy Routes
const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3'

app.get('/make-server-9a7f9b62/api/global', async (c) => {
  try {
    const response = await fetch(`${COINGECKO_BASE_URL}/global`)
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`)
    }
    const data = await response.json()
    return c.json(data)
  } catch (error) {
    console.log(`Global market data fetch error: ${error}`)
    return c.json({ error: 'Failed to fetch global market data' }, 500)
  }
})

app.get('/make-server-9a7f9b62/api/coins/markets', async (c) => {
  try {
    const { vs_currency, order, per_page, page, sparkline, price_change_percentage } = c.req.query()
    
    const params = new URLSearchParams({
      vs_currency: vs_currency || 'usd',
      order: order || 'market_cap_desc',
      per_page: per_page || '100',
      page: page || '1',
      sparkline: sparkline || 'true',
      price_change_percentage: price_change_percentage || '7d'
    })
    
    const response = await fetch(`${COINGECKO_BASE_URL}/coins/markets?${params}`)
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`)
    }
    const data = await response.json()
    return c.json(data)
  } catch (error) {
    console.log(`Coins markets fetch error: ${error}`)
    return c.json({ error: 'Failed to fetch coins market data' }, 500)
  }
})

app.get('/make-server-9a7f9b62/api/coins/:id', async (c) => {
  try {
    const coinId = c.req.param('id')
    const { localization, tickers, market_data, community_data, developer_data } = c.req.query()
    
    const params = new URLSearchParams({
      localization: localization || 'false',
      tickers: tickers || 'false',
      market_data: market_data || 'true',
      community_data: community_data || 'false',
      developer_data: developer_data || 'false'
    })
    
    const response = await fetch(`${COINGECKO_BASE_URL}/coins/${coinId}?${params}`)
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`)
    }
    const data = await response.json()
    return c.json(data)
  } catch (error) {
    console.log(`Coin detail fetch error: ${error}`)
    return c.json({ error: `Failed to fetch data for coin: ${c.req.param('id')}` }, 500)
  }
})

app.get('/make-server-9a7f9b62/api/coins/:id/market_chart', async (c) => {
  try {
    const coinId = c.req.param('id')
    const { vs_currency, days } = c.req.query()
    
    const params = new URLSearchParams({
      vs_currency: vs_currency || 'usd',
      days: days || '7'
    })
    
    const response = await fetch(`${COINGECKO_BASE_URL}/coins/${coinId}/market_chart?${params}`)
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`)
    }
    const data = await response.json()
    return c.json(data)
  } catch (error) {
    console.log(`Coin history fetch error: ${error}`)
    return c.json({ error: `Failed to fetch history for coin: ${c.req.param('id')}` }, 500)
  }
})

app.get('/make-server-9a7f9b62/api/search', async (c) => {
  try {
    const { query } = c.req.query()
    
    if (!query) {
      return c.json({ error: 'Query parameter is required' }, 400)
    }
    
    const response = await fetch(`${COINGECKO_BASE_URL}/search?query=${encodeURIComponent(query)}`)
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`)
    }
    const data = await response.json()
    return c.json(data)
  } catch (error) {
    console.log(`Search fetch error: ${error}`)
    return c.json({ error: 'Failed to search coins' }, 500)
  }
})

Deno.serve(app.fetch)