const helpers = {
  removeValidation: address =>
    Object.keys(address).reduce(
      (acc, key) => ({
        ...acc,
        [key]: address[key].value,
      }),
      {}
    ),
}

module.exports = { helpers }
