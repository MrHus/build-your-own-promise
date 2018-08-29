const code = `
const p = MadPromise(resolve => {
  setTimeout(() => { 
    resolve(42)
  }, 2000);
});

p.then(v => v * 2)
  .then(age => ({
    name: 'Maarten Hus',
    age
  }))
  .then(person => {
    return x / 20;
  })
  .then(person => {
    LOGGER.info(person);
  })
  .catch(error => {
    LOGGER.error(error.message);
    return 1337;
  }).then(value => {
    LOGGER.info("Rescued with value: " + value);
    return value;
  });
`;

export default code;