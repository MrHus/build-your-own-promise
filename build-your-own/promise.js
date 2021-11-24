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
  let status = 'pending';
  let value = null;
  let callbacks = [];

  function resolve(value) {
    transition('fulfilled', value);
  }

  function reject(reason) {
    transition('rejected', reason);
  }

  function transition(newStatus, newValue) {
    if (status !== 'pending') {
      return;
    }

    status = newStatus;

    value = newValue;

    callbacks.forEach(handleCallback);

    // Clean up callbacks to prevent memory leaks.
    callbacks = null;
  }

  function handleCallback({ resolve, onResolve, reject, onReject }) {
    setTimeout(() => {
      if (status === 'fulfilled') {
        try {
          const result = onResolve(value);

          unpackResult(result, resolve, reject);
        } catch (e) {
          const rejectedValue = onReject(e);

          reject(rejectedValue);
        }
      } else {
        if (onReject === passThrough) {
          reject(value);
        } else {
          const result = onReject(value);

          unpackResult(result, resolve, reject);
        }
      }
    }, 1);
  }

  function unpackResult(result, resolve, reject) {
    if (isMadPromise(result)) {
      result.then(resolve).catch(reject);
    } else {
      resolve(result);
    }
  }

  function then(onResolve, onReject = passThrough) {
    return MadPromise((resolve, reject) => {
      const callback = { resolve, onResolve, reject, onReject };

      if (status === 'pending') {
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
    catch: _catch,
  };
}

MadPromise.all = function (promises) {
  let count = 0;

  return MadPromise((resolve, reject) => {
    const results = [];

    promises.forEach((promise, index) => {
      promise
        .then((value) => {
          count += 1;
          results[index] = value;

          if (count === promises.length) {
            resolve(results);
          }
        })
        .catch(reject);
    });
  });
};

MadPromise.race = function (promises) {
  return MadPromise((resolve, reject) => {
    promises.forEach((promise) => {
      promise.then(resolve).catch(reject);
    });
  });
};
