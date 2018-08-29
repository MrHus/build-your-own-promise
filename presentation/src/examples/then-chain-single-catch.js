const code = `
const p = MadPromise((resolve, reject) => {
  setTimeout(() => { 
    reject("Some error");
  }, 2000);
});

p.then(v => v * 2)
  .then(age => ({
    name: 'Maarten Hus',
    age
  }))
  .then(person => {
    LOGGER.info(person);
  })
  .catch(error => {
    LOGGER.error(error);
    return error;
  });
`;

export default code;