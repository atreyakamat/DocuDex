module.exports = {
  authenticator: {
    generateSecret: () => 'mock-secret',
    generate: () => '123456',
    verify: ({ token, secret }) => token === '123456' || token === 'valid-code',
    keyuri: (email, issuer, secret) => `otpauth://totp/${issuer}:${email}?secret=${secret}`,
  }
};
