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
    return error;
  });
`;

export default code;