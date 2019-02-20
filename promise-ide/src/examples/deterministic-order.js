const code = `
LOGGER.info(1);

const a = MadPromise((resolve, reject) => {
  LOGGER.info(2);
  setTimeout(() => {
    LOGGER.info(5);
    resolve(42);
  }, 1000);
});

LOGGER.info(3);

a.then(value => {
  LOGGER.info("Resolved with value: " + value);
  return value;
})

LOGGER.info(4);
`;

export default code;