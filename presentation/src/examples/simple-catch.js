const code = `
const a = MadPromise((resolve, reject) => {
  setTimeout(() => {
    reject(1);
  }, 2000);
});

a.catch((error) => {
  LOGGER.error(error);
  return error;
});
`;

export default code;