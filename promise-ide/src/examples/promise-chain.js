const code = `
const a = MadPromise((resolve, reject) => {
  setTimeout(() => {
    resolve(1);
  }, 800);
});

a.then(() => {
  return MadPromise(resolve => {
    setTimeout(() => {
      resolve(2);
    }, 800);
  });
})
  .then(() => {
    return MadPromise(resolve => {
      setTimeout(() => {
        resolve(3);
      }, 800);
    });
  })
  .then(() => {
    return MadPromise(resolve => {
      setTimeout(() => {
        resolve(4);
      }, 800);
    });
  })
  .then(() => {
    return MadPromise(resolve => {
      setTimeout(() => {
        resolve(5);
      }, 800);
    });
  })
  .then(value => {
    LOGGER.info(value);
    return value;
  });
`;

export default code;