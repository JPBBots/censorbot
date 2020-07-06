const express = require('express')

const app = express()

app.set('view engine', 'ejs')

app.set('views', require('path').resolve(__dirname, './views'))

app.get('/', (req, res) => {
  res.render('guild', {
    guild: {
      i: '569907007465848842',
      n: 'Testing',
      c: [
        { id: '657711340076400652', name: 'test-blah' },
        { id: '689935590334267528', name: 'yes' },
        { id: '708128607892930680', name: 'general' },
        { id: '708128670992171009', name: 'log' }
      ],
      r: [
        { id: '569907007465848842', name: '@​everyone' },
        { id: '657637687439917086', name: 'Testing' },
        { id: '689915428905943078', name: 'boop' },
        { id: '707324394631987271', name: 'Censor Bot Testing' },
        { id: '714388963841802283', name: 'hello' },
        { id: '714389219664986243', name: 'Censor Bot' }
      ]
    },
    db: require('../client/Config').config,
    premium: true
  })
})

app.listen(1235)
