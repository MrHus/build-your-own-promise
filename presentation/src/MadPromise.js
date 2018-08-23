let name = 'A';

function isMadPromise(object) {
  return (
    typeof object === 'object' &&
    typeof object.then === 'function' &&
    typeof object.catch === 'function'
  );
}

export function MadPromise(visualize, deferred, parent) {
  let status = 'PENDING';
  let value = null;
  let callbacks = [];

  const promiseName = name;

  if (visualize === null) {
    visualize = () => undefined;
  }

  visualize({ name: promiseName, parent, status: 'PENDING' });
  name = nextName(name);

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

    visualize({ name: promiseName, status, value: v });

    callbacks.forEach(handleCallback);
    callbacks = null;
  }

  function reject(e) {
    if (status !== 'PENDING') {
      throw new Error('Promise cannot be rejected twice');
    }

    status = 'REJECTED';

    value = e;

    console.log(e);

    visualize({ name: promiseName, status, value: e });

    callbacks.forEach(handleCallback);
    callbacks = null;
  }

  function then(onResolve, onReject = e => e) {
    return MadPromise(
      visualize,
      (resolve, reject) => {
        const callback = { resolve, onResolve, reject, onReject };

        if (status === 'PENDING') {
          callbacks.push(callback);
        } else {
          handleCallback(callback);
        }
      },
      promiseName
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

function nextName(c) {
  return String.fromCharCode(c.charCodeAt(0) + 1);
}
