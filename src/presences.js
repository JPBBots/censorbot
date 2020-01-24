module.exports = (client) => {
  client.presences = {
    d: async () => {
      return {
        activity: {
          type: "WATCHING",
          name: `For Bad Words | ${(await client.shard.fetchClientValues("guilds.size").then(x=>x.reduce((a,b) => a+b, 0))).toLocaleString()} Servers`
        },
        status: "online"
      }
    },
    err: async () => {
      return {
        activity: {
          type: "PLAYING",
          name: "Some errors are happening"
        },
        status: "dnd"
      }
    },
    slow: async () => {
      return {
        activity: {
          type: "PLAYING",
          name: "Our servers are a little slow. Sorry for any inconvenience"
        },
        status: "idle"
      }
    }
  }
  client.p = "d"
}