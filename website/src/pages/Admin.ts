import { Page, PageInterface } from "../structures/Page";

export class Admin extends Page implements PageInterface {
  name = 'admin'
  url = /admin$/
  fetchElements = [
    'admin'
  ]

  async loading () {
    await this.api.waitForUser()
  }

  async go () {
    const stats = await this.api.getStats(true)
    if (!stats) return
    
    stats.forEach(stat => {
      const cluster = document.createElement('div')

      const h3 = document.createElement('h3')
            h3.innerText = `Cluster ${stat.cluster.id}`
            h3.appendChild(document.createElement('br'))
            h3.appendChild(document.createTextNode(`${(stat.cluster.memory / 1024 / 1024).toFixed(0)}MB`))
      cluster.appendChild(h3)

      const inner = document.createElement('div')

      stat.shards.forEach(shard => {
        const shardDiv = document.createElement('div')
              shardDiv.setAttribute('state', shard.state.toString())
        
        const p = document.createElement('p')
              p.innerText = `Shard ${shard.id}`
        shardDiv.appendChild(p)

        const info = document.createElement('div')
              info.appendChild(document.createTextNode(`${shard.guilds} servers`))
              info.appendChild(document.createElement('br'))
              info.appendChild(document.createTextNode(`${shard.ping || 0}ms`))
              info.appendChild(document.createElement('br'))
              info.appendChild(document.createTextNode(`${shard.events}ev/m`))
        shardDiv.appendChild(info)

        inner.appendChild(shardDiv)
      })

      cluster.appendChild(inner)

      this.e('admin').appendChild(cluster)
    })
  }

  async remove () {
    return true
  }
}