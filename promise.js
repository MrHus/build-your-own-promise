'use strict';

function isMadPromise(object) {
  return (
    typeof object === 'object' &&
    typeof object.then === 'function' &&
    typeof object.catch === 'function'
  );
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

    callbacks.forEach(handleCallback);
    callbacks = null;
  }

  function reject(e) {
    if (status !== 'PENDING') {
      throw new Error('Promise cannot be rejected twice');
    }

    status = 'REJECT';

    value = e;

    callbacks.forEach(handleCallback);
    callbacks = null;
  }

  function then(onResolve, onReject = e => e) {
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
    return then(v => v, onReject);
  }

  deferred(resolve, reject);

  return {
    then,
    catch: _catch
  };
}
