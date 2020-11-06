const shortnames = {
  berry: '142408079177285632',
  bowsie: '359794248570109972',
  billy: '254976867306700800',
  edgy: '298598074194853889',
  limit: '467593308839870475',
  lobster: '601784957664493608',
  nevy: '507444005030854656',
  parm: '172075838806818817',
  peter: '209735985158815744',
  zenko: '427952010340597760'
}

module.exports = function (r) {
  r.use('/', (req, res, next) => {
    if (req.query.user) {
      req.user = Object.keys(shortnames).find(x => shortnames[x] === req.query.user) || req.query.user
    }
    next()
  })
}
