const fetch = require('node-fetch')
const querystring = require('querystring')

function request (url, heads, opts = {}, ...req) {
  return new Promise((resolve, reject) => {
    const [method, route, { query, body, headers, parser = JSON.stringify }, end] = req
    end()

    const go = () => {
      fetch(`${url}${route}${query || opts.query ? `?${querystring.stringify({ ...query, ...opts.query || {} })}` : ''}`, {
        method,
        headers: {
          'Content-Type': opts.contentType ? opts.contentType : 'application/json',
          ...heads,
          ...headers
        },
        body: body ? parser(body) : null
      })
        .then(res => {
          if (res.status === 204) return { success: true }

          return res[opts.format || 'json']()
        })
        .then(parsed => {
          if (parsed && parsed.retry_after) {
            return setTimeout(() => {
              go()
            }, parsed.retry_after)
          }
          resolve(parsed)
        })
    }

    go()
  })
}

module.exports = request
