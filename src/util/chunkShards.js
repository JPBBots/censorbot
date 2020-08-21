module.exports = (shards, perCluster) => {
  const entries = Array(shards).fill().reduce((a,_,i) => a.concat([ i ]), [])
  const chunkSize = (Math.ceil(shards / perCluster))

  const result = [];
  const amount = Math.floor(entries.length / chunkSize);
  const mod = entries.length % chunkSize;

  for (let i = 0; i < chunkSize; i++) {
      result[i] = entries.splice(0, i < mod ? amount + 1 : amount);
  }

  return result;
}
