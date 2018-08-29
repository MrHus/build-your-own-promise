const code = `
const a = MadPromise(resolve => {
  setTimeout(() => resolve(42), 100);
});

a.then(v => v * 2)
  .then(age => ({
    name: 'Maarten Hus',
    age
  }))
  .then(person => {
    LOGGER.info(person);
  });
`;

export default code;