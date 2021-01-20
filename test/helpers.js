const isValidTimestamp = (timestamp) => {
  const date = new Date(Number(timestamp))
  return date instanceof Date && !isNaN(date)
}

module.exports = { isValidTimestamp }
