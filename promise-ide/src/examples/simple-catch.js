const code = `
const a = MadPromise((resolve, reject) => {
  setTimeout(() => {
    reject("Some error");
  }, 2000);
});

a.catch((error) => {
  LOGGER.error(error);
  return error;
});
`;

export default code;