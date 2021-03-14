import { Page, PageInterface } from "../structures/Page";
import { E } from '../structures/Elements'
import { AdminResponse } from "../typings/api";

export class Admin extends Page implements PageInterface {
  name = 'admin'
  url = /admin$/
  fetchElements = [
    'admin',
    'servers'
  ]

  async loading() {
    await this.api.waitForUser()
  }

  update(stats: AdminResponse) {
    this.e('servers').innerText = stats.reduce((a, b) => a + b.shards.reduce((c, d) => c + d.guilds, 0), 0).toLocaleString()
    document.querySelectorAll('[id^=cluster-]').forEach(cluster => {
      const id = Number(cluster.id.split('-')[1])
      const stat = stats.find(x => x.cluster.id === id)
      cluster.querySelector('h3').childNodes[2].textContent = `${(stat.cluster.memory / 1024 / 1024).toFixed(0)}MB`

      Array().slice.call(cluster.querySelector('div').children).forEach((shard: HTMLElement) => {
        const shardStat = stat.shards.find(x => x.id === Number(shard.id))
        shard.setAttribute('state', `${shardStat.state}`)
        E.set(shard.querySelector('div'), [
          { elm: 'text', text: `${shardStat.guilds} servers` },
          { elm: 'br' },
          { elm: 'text', text: `${shardStat.ping || 0}ms` },
          { elm: 'br' },
          { elm: 'text', text: `${shardStat.events}ev/m` },
        ])
      })
    })
  }

  async go() {
    const stats = await this.api.getStats(true)
    if (!stats) return

    E.set(this.e('admin'), stats.map(stat => ({
      elm: 'div',
      id: `cluster-${stat.cluster.id}`,
      children: [
        {
          elm: 'h3',
          text: `Cluster ${stat.cluster.id}`,
          children: [
            { elm: 'br' },
            { elm: 'text', text: 'Loading...' }
          ]
        },
        {
          elm: 'div',
          children: stat.shards.map(shard => ({
            elm: 'div',
            id: `${shard.id}`,
            children: [
              {
                elm: 'p',
                text: `Shard ${shard.id}`
              },
              { elm: 'div' },
              {
                elm: 'a',
                classes: ['button'],
                attr: { special: '' },
                text: 'Restart',
                events: {
                  click: (event) => {
                    (event.target as HTMLButtonElement).parentElement.setAttribute('state', '0')
                    this.log(`Restarting shard ${shard.id}`)
                    this.api.restartShard(shard.id)
                  }
                }
              }
            ]
          }))
        }
      ]
    })))

    this.update(stats)

    this.registry.interval = setInterval(async () => {
      if (document.hidden) return
      const res = await this.api.getStats(false)
      if (!res) return
      this.update(res)
    }, 5000)
  }

  async remove() {
    clearInterval(this.registry.interval)
    return true
  }
}