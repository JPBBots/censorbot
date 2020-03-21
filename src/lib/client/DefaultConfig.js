module.exports = {
  base: true,
  languages: ['en', 'es', 'off'],
  censor: {
    msg: true,
    emsg: true,
    nick: true,
    react: true
  },
  log: null,
  role: null,
  filter: [],
  uncensor: [],
  pop_delete: 3000,
  msg: null,
  punishment: {
    type: 0,
    amount: 3,
    role: null
  },
  webhook: false,
  channels: [],
  multi: false
}
