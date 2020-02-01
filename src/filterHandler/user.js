module.exports = async (client, user) => {
  const response = await client.filter.test(user.username)
}
