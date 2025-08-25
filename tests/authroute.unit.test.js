const express = require('express')
const request = require('supertest')

// -- Mocks statiques (avant import du router)
jest.mock('axios', () => ({ post: jest.fn() }))
jest.mock('jsonwebtoken', () => ({ sign: jest.fn(() => 'signed.jwt.token') }))

// On stocke l'état de mock dans global (accessible dans jest.mock)
global.__passportMockState = {
  mode: 'redirect', // 'redirect' | 'success' | 'db-fail'
  profile: null,
}

// Mock passport basé sur cet état global
jest.mock('passport', () => {
  const fn = jest.fn((strategy, opts) => {
    if (opts && opts.failureRedirect) {
      return (req, res, next) => {
        const state = global.__passportMockState
        if (state.mode === 'success') {
          req.user = state.profile
          return next()
        }
        if (state.mode === 'db-fail') {
          return res.redirect(opts.failureRedirect)
        }
        return res.redirect(opts.failureRedirect)
      }
    }
    // route /auth (kickoff)
    return (_req, res) => res.redirect('https://accounts.google.com')
  })
  return { authenticate: fn }
})

const axios = require('axios')

function loadRouterFresh() {
  jest.isolateModules(() => {
    global._router = require('../src/routes/authRoutes')
  })
  return global._router
}

function makeApp(router, { isAuth = false, user = null, logout = (cb) => cb?.() } = {}) {
  const app = express()
  app.use((req, _res, next) => {
    req.isAuthenticated = () => isAuth
    req.user = user
    req.logout = logout
    next()
  })
  app.use('/auth', router)
  return app
}

beforeEach(() => {
  jest.clearAllMocks()
  global.__passportMockState.mode = 'redirect'
  global.__passportMockState.profile = null
})

describe('routes/authroute (unit)', () => {
  test('GET /auth redirige vers provider', async () => {
    const router = loadRouterFresh()
    const app = makeApp(router)

    const res = await request(app).get('/auth')
    expect(res.status).toBe(302)
    expect(res.header.location).toBe('https://accounts.google.com')
  })

  test('GET /auth/google/callback -> succès DB', async () => {
    global.__passportMockState.mode = 'success'
    global.__passportMockState.profile = {
      emails: [{ value: 'fake@gmail.com' }],
      name: { givenName: 'John', familyName: 'Doe' },
    }

    axios.post.mockResolvedValueOnce({
      data: { _id: 'u1', email: 'fake@gmail.com', first_name: 'John', last_name: 'Doe' },
    })

    const router = loadRouterFresh()
    const app = makeApp(router)
    const res = await request(app).get('/auth/google/callback')

    expect(res.status).toBe(302)
    expect(res.header.location).toMatch(/\/auth\/callback\?token=/)
  })

  test('GET /auth/google/callback -> échec DB => "/"', async () => {
    global.__passportMockState.mode = 'success'
    global.__passportMockState.profile = {
      emails: [{ value: 'x@y.com' }],
      name: { givenName: 'Fail', familyName: 'User' },
    }
    axios.post.mockRejectedValueOnce(new Error('DB error'))

    const router = loadRouterFresh()
    const app = makeApp(router)
    const res = await request(app).get('/auth/google/callback')

    expect(res.status).toBe(302)
    expect(res.header.location).toBe('/')
  })

  test('GET /auth/profile non authentifié', async () => {
    const router = loadRouterFresh()
    const app = makeApp(router, { isAuth: false })
    const res = await request(app).get('/auth/profile')

    expect(res.status).toBe(302)
    expect(res.header.location).toBe('/auth')
  })

  test('GET /auth/profile authentifié', async () => {
    const router = loadRouterFresh()
    const app = makeApp(router, { isAuth: true, user: { displayName: 'TestUser' } })
    const res = await request(app).get('/auth/profile')

    expect(res.status).toBe(200)
    expect(res.text).toMatch(/Bienvenue TestUser/)
  })

  test('GET /auth/logout', async () => {
    const logoutMock = jest.fn((cb) => cb())
    const router = loadRouterFresh()
    const app = makeApp(router, { logout: logoutMock })

    const res = await request(app).get('/auth/logout')

    expect(logoutMock).toHaveBeenCalled()
    expect(res.status).toBe(302)
    expect(res.header.location).toBe('/')
  })
})
