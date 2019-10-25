const router = require('express').Router()

router.get('*', (req, res) => {
  res.status(301)
  res.json(
    {
      error: 'Old endpoint'
    }
  )
})

module.exports = router
