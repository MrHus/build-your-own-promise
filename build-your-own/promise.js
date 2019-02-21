'use strict';

function isMadPromise(object) {
  return (
    typeof object === 'object' &&
    typeof object.then === 'function' &&
    typeof object.catch === 'function'
  );
}

function passThrough(value) {
  return value;
}

export function MadPromise(deferred) {
  let status = 'PENDING';
  let value = null;
  let callbacks = [];

  function handleCallback({ resolve, onResolve, reject, onReject }) {
    setTimeout(() => {
      if (status === 'RESOLVED') {
        try {
          const resolvedValue = onResolve(value);

          if (isMadPromise(resolvedValue)) {
            resolvedValue.then(v => resolve(v)).catch(e => reject(e));
          } else {
            resolve(resolvedValue);
          }
        } catch (e) {
          const rejectedValue = onReject(e);

          reject(rejectedValue);
        }
      } else {
        const rejectedValue = onReject(value);

        if (isMadPromise(rejectedValue)) {
          rejectedValue.then(v => resolve(v)).catch(e => reject(e));
        } else {
          if (onReject === passThrough) {
            reject(rejectedValue);
          } else {
            resolve(rejectedValue);
          }
        }
      }
    }, 1);
  }

  function resolve(v) {
    if (status !== 'PENDING') {
      throw new Error('Promise cannot be resolved twice');
    }

    status = 'RESOLVED';

    value = v;

    callbacks.forEach(handleCallback);
    callbacks = null;
  }

  function reject(e) {
    if (status !== 'PENDING') {
      throw new Error('Promise cannot be rejected twice');
    }

    status = 'REJECTED';

    value = e;

    callbacks.forEach(handleCallback);
    callbacks = null;
  }

  function then(onResolve, onReject = passThrough) {
    return MadPromise((resolve, reject) => {
      const callback = { resolve, onResolve, reject, onReject };

      if (status === 'PENDING') {
        callbacks.push(callback);
      } else {
        handleCallback(callback);
      }
    });
  }

  function _catch(onReject) {
    return then(passThrough, onReject);
  }

  deferred(resolve, reject);

  return {
    then,
    catch: _catch
  };
}

MadPromise.all = function(promises) {
  let promisesResolved = 0;
  let rejected = false;

  return MadPromise((resolve, reject) => {
    const results = [];

    promises.forEach((promise, index) => {
      promise
        .then(value => {
          promisesResolved += 1;
          results[index] = value;

          if (promisesResolved === promises.length) {
            resolve(results);
          }
        })
        .catch(error => {
          if (!rejected) {
            rejected = true;
            reject(error);
          }
        });
    });
  });
};

MadPromise.race = function(promises) {
  let done = false;

  return MadPromise((resolve, reject) => {
    promises.forEach(promise => {
      promise
        .then(value => {
          if (!done) {
            done = true;
            resolve(value);
          }
        })
        .catch(error => {
          if (!done) {
            done = true;
            reject(error);
          }
        });
    });
  });
};