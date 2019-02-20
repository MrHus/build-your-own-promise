const code = `
const a = MadPromise((resolve, reject) => {
  setTimeout(() => {
    resolve(1);
  }, 2000);
});

a.then((value) => {
  LOGGER.info(value);
  return value;
});
`;

export default code;