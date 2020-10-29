module.exports = {
  isEqual(a, b, options) {
    if (a) {
      a = a.toString()
    }
    if (a === b.toString()) {
      return options.fn(this)
    }
    return options.inverse(this)
  },
}
