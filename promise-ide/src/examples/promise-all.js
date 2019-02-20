const code = `
const a = MadPromise(resolve => {
  setTimeout(() => resolve(42), 1000);
});

const b = MadPromise(resolve => {
  setTimeout(() => resolve(1337), 100);
});

MadPromise.all([a, b]).then(([aValue, bValue]) => {
  LOGGER.info("Got all values a: " + aValue + " b: " + bValue);
});
`;

export default code;