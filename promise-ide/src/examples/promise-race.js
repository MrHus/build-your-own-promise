const code = `
const a = MadPromise(resolve => {
  setTimeout(() => resolve('a'), 100);
});

const b = MadPromise(resolve => {
  setTimeout(() => resolve('b'), 50);
});

MadPromise.race([a, b]).then(value => {
  LOGGER.info(value + " was first");
});
`;

export default code;