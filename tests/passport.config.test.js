// tests/passport.config.test.js

// Mocks stockés sur global pour éviter "out-of-scope" dans jest.mock()
const passportUseMock = jest.fn();
const serializeUserMock = jest.fn();
const deserializeUserMock = jest.fn();

global.__passportMocks = {
  use: passportUseMock,
  serializeUser: serializeUserMock,
  deserializeUser: deserializeUserMock,
};

// Mock de 'passport'
jest.mock('passport', () => ({
  use: (...args) => global.__passportMocks.use(...args),
  serializeUser: (fn) => global.__passportMocks.serializeUser(fn),
  deserializeUser: (fn) => global.__passportMocks.deserializeUser(fn),
}));

// ⚠️ Ton code fait: const OpenIDConnectStrategy = require('passport-openidconnect')
// => on doit exporter directement un constructeur (pas { Strategy })
jest.mock(
  'passport-openidconnect',
  () =>
    function OpenIDConnectStrategy(options, verify) {
      return { name: 'openidconnect', _opts: options, _verify: verify };
    },
  { virtual: true }
);

// Ton code fait: require('passport-facebook').Strategy
jest.mock(
  'passport-facebook',
  () => ({
    Strategy: function FacebookStrategy(options, verify) {
      return { name: 'facebook', _opts: options, _verify: verify };
    },
  }),
  { virtual: true }
);

// Variables d'env attendues par la config
process.env.CLIENT_ID = 'dummy-client-id';
process.env.CLIENT_SECRET_CODE = 'dummy-secret';
process.env.CALLBACK_URL = 'http://localhost:3004/auth/google/callback';

describe('config/passportConfig', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // IMPORTANT: charger la config après avoir posé les mocks
    jest.isolateModules(() => {
      require('../src/config/passportConfig'); // ajuste si ton chemin diffère
    });
  });

  test('enregistre une stratégie OpenID Connect (Google)', () => {
    expect(global.__passportMocks.use).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'openidconnect' })
    );
    const call = global.__passportMocks.use.mock.calls.find(
      ([arg]) => arg?.name === 'openidconnect'
    );
    expect(call).toBeTruthy();
    const strat = call[0];
    expect(strat._opts).toMatchObject({
      issuer: 'https://accounts.google.com',
      authorizationURL: 'https://accounts.google.com/o/oauth2/auth',
      tokenURL: 'https://oauth2.googleapis.com/token',
      userInfoURL: 'https://openidconnect.googleapis.com/v1/userinfo',
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET_CODE,
      callbackURL: process.env.CALLBACK_URL,
      scope: ['openid', 'profile', 'email'],
    });
    expect(typeof strat._verify).toBe('function');
  });

  test('enregistre une stratégie Facebook', () => {
    expect(global.__passportMocks.use).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'facebook' })
    );
    const call = global.__passportMocks.use.mock.calls.find(
      ([arg]) => arg?.name === 'facebook'
    );
    expect(call).toBeTruthy();
    const strat = call[0];
    expect(strat._opts).toMatchObject({
      clientID: 'TON_APP_ID_FACEBOOK',
      clientSecret: 'TON_APP_SECRET_FACEBOOK',
      callbackURL: 'http://localhost:3004/auth/facebook/callback',
      profileFields: ['id', 'displayName', 'photos', 'email'],
    });
    expect(typeof strat._verify).toBe('function');
  });

  test('configure serializeUser', () => {
    expect(global.__passportMocks.serializeUser).toHaveBeenCalledTimes(1);
    const [fn] = global.__passportMocks.serializeUser.mock.calls[0];
    expect(typeof fn).toBe('function');
  });

  test('configure deserializeUser', () => {
    expect(global.__passportMocks.deserializeUser).toHaveBeenCalledTimes(1);
    const [fn] = global.__passportMocks.deserializeUser.mock.calls[0];
    expect(typeof fn).toBe('function');
  });
});
