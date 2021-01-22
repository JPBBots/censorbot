import { Page, PageInterface } from "../structures/Page";

export class Admin extends Page implements PageInterface {
  name = 'admin'
  url = /admin$/
  fetchElements = [
    'admin',
    'servers'
  ]

  async loading () {
    await this.api.waitForUser()
  }
  
  update (stats: AdminResponse) {
    this.e('servers').innerText = stats.reduce((a, b) => a + b.shards.reduce((c, d) => c + d.guilds, 0), 0).toLocaleString()
    document.querySelectorAll('[id^=cluster-]').forEach(cluster => {
      const id = Number(cluster.id.split('-')[1])
      const stat = stats.find(x => x.cluster.id === id)
      cluster.querySelector('h3').childNodes[2].textContent = `${(stat.cluster.memory / 1024 / 1024).toFixed(0)}MB`

      Array().slice.call(cluster.querySelector('div').children).forEach((shard: HTMLElement) => {
        const shardStat = stat.shards.find(x => x.id === Number(shard.id))
        shard.setAttribute('state', `${shardStat.state}`)
        const info = shard.querySelector('div')
        info.innerHTML = ''
        info.appendChild(document.createTextNode(`${shardStat.guilds} servers`))
        info.appendChild(document.createElement('br'))
        info.appendChild(document.createTextNode(`${shardStat.ping || 0}ms`))
        info.appendChild(document.createElement('br'))
        info.appendChild(document.createTextNode(`${shardStat.events}ev/m`))
      })
    })
  }

  async go () {
    const stats = await this.api.getStats(true)
    if (!stats) return
    
    stats.forEach(stat => {
      const cluster = document.createElement('div')
      cluster.id = `cluster-${stat.cluster.id}`

      const h3 = document.createElement('h3')
            h3.innerText = `Cluster ${stat.cluster.id}`
            h3.appendChild(document.createElement('br'))
            h3.appendChild(document.createTextNode('Loading...'))
      cluster.appendChild(h3)

      const inner = document.createElement('div')

      stat.shards.forEach(shard => {
        const shardDiv = document.createElement('div')
              shardDiv.id = `${shard.id}`
        
        const p = document.createElement('p')
              p.innerText = `Shard ${shard.id}`
        shardDiv.appendChild(p)

        const info = document.createElement('div')
        shardDiv.appendChild(info)

        const button = document.createElement('a')
              button.onclick = () => {
                this.log('Restarting shard ' + shard.id)
                this.api.restartShard(shard.id)
                shardDiv.setAttribute('state', '0')
              }
              button.classList.add('button')
              button.setAttribute('special', '')
              button.innerText = 'Restart'
        shardDiv.appendChild(button)

        inner.appendChild(shardDiv)
      })

      cluster.appendChild(inner)

      this.e('admin').appendChild(cluster)
    })

    this.update(stats)

    this.registry.interval = setInterval(async () => {
      if (document.hidden) return
      const res = await this.api.getStats(false)
      if (!res) return
      this.update(res)
    }, 5000)
  }

  async remove () {
    clearInterval(this.registry.interval)
    return true
  }
}