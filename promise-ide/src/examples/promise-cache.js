const code = `
LOGGER.info("Start");

const a = MadPromise((resolve, reject) => {
  LOGGER.info("Immediately resolve with 42");
  resolve(42);
});

LOGGER.info("Waiting for someone to listen...");

setTimeout(() => {
  a.then(value => {
    LOGGER.info("Finally someone listened and got value: " + value);
    return value;
  });
}, 5000);
`;

export default code;