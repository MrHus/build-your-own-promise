/*
   This promise implementation allows for visualization through a
   visualizer, which is a function which needs to be set on
   window.MadPromise.visualize, this function will get called
   each time the promise changes status.

   The `visualize` function gets called with a single argument
   which is an object which contains the following data:

   {
    name: string      // The name of the promise, a letter of the alphabet.
    parent: string    // The parent of the promise, which is also a letter of the alphabet
    status: string    // The status of the promise either: 'PENDING', 'RESOLVED', 'REJECTED'
    chainId: number   // The id of the promise chain this promise is a part of.
    value: *          // The current value of the promise, is undefined when 'PENDING'.
    time: Date        // The time at which the call to visualize was made.
  }
*/

function isMadPromise(object) {
  return (
    typeof object === 'object' &&
    typeof object.then === 'function' &&
    typeof object.catch === 'function'
  );
}

let id = 0;
let name = 'A';

export function MadPromise(deferred, parent, chainId) {
  let status = 'PENDING';
  let value = null;
  let callbacks = [];

  if (chainId === undefined) {
    chainId = id;
    id += 1;
  }

  const promiseName = nextName();

  MadPromise.visualize({
    name: promiseName,
    parent,
    status: 'PENDING',
    chainId,
    time: new Date()
  });

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
        } else if (value === rejectedValue) {
          reject(rejectedValue);
        } else {
          resolve(rejectedValue);
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

    MadPromise.visualize({
      name: promiseName,
      parent,
      chainId,
      status,
      value: v,
      time: new Date()
    });

    callbacks.forEach(handleCallback);
    callbacks = null;
  }

  function reject(e) {
    if (status !== 'PENDING') {
      throw new Error('Promise cannot be rejected twice');
    }

    status = 'REJECTED';

    value = e;

    MadPromise.visualize({
      name: promiseName,
      parent,
      chainId,
      status,
      value: e,
      time: new Date()
    });

    callbacks.forEach(handleCallback);
    callbacks = null;
  }

  function then(onResolve, onReject = e => e) {
    return MadPromise(
      (resolve, reject) => {
        const callback = { resolve, onResolve, reject, onReject };

        if (status === 'PENDING') {
          callbacks.push(callback);
        } else {
          handleCallback(callback);
        }
      },
      promiseName,
      chainId
    );
  }

  function _catch(onReject) {
    return then(v => v, onReject);
  }

  deferred(resolve, reject);

  return {
    then,
    catch: _catch
  };
}

function nextName() {
  const current = name;
  name = String.fromCharCode(name.charCodeAt(0) + 1);
  return current;
}

export function resetName() {
  name = 'A';
}

MadPromise.all = function(promises) {
  let promisesResolved = 0;

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
          reject(error);
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
