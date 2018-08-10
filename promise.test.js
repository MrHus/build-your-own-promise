'use strict';

jest.setTimeout(200);

import { MadPromise } from './promise';

describe('MadPromise', () => {
  describe('basic behavior', () => {
    it('should when the promise is resolved provide the value to the onResolve callback', done => {
      const p = MadPromise(resolve => {
        setTimeout(() => resolve(42), 100);
      });

      p.then(v => {
        expect(v).toBe(42);
        done();
      });
    });

    it('should when the promise is rejected provide the value to the onReject callback', done => {
      const p = MadPromise((resolve, reject) => {
        setTimeout(() => reject(42), 100);
      });

      p.catch(v => {
        expect(v).toBe(42);
        done();
      });
    });
  });

  describe('chaining behavior', () => {
    it('should allow chaining of promises', done => {
      const p = MadPromise(resolve => {
        setTimeout(() => resolve(42), 100);
      });

      p.then(v => v * 2)
        .then(age => ({
          name: 'Maarten Hus',
          age
        }))
        .then(person => {
          expect(person).toEqual({ name: 'Maarten Hus', age: 84 });
          done();
        });
    });

    it('should when promises are chained allow for a single catch for all promises', done => {
      const p = MadPromise((resolve, reject) => {
        setTimeout(() => reject(42), 100);
      });

      p.then(v => v * 2)
        .then(age => ({
          name: 'Maarten Hus',
          age
        }))
        .then(person => {
          console.log(person);
        })
        .catch(e => {
          expect(e).toBe(42);
          done();
        });
    });

    it('should when an error occurs inside of a then end up in the catch', done => {
      const p = MadPromise(resolve => {
        setTimeout(() => resolve(42), 100);
      });

      p.then(v => v * 2)
        .then(age => {
          name: 'Maarten Hus', age;
        })
        .then(person => {
          return x / 20;
        })
        .catch(e => {
          expect(e.message).toBe('x is not defined');
          done();
        });
    });

    it('should allow a catch to recover from errors when promise is rejected', done => {
      const p = MadPromise((resolve, reject) => {
        setTimeout(() => reject(42), 100);
      });

      p.then(v => v * 2)
        .then(age => ({
          name: 'Maarten Hus',
          age
        }))
        .then(person => {
          console.log(person);
        })
        .catch(e => 1337)
        .then(recoveredValue => {
          expect(recoveredValue).toBe(1337);
          done();
        });
    });

    it('should when a then causes an error allow catch to recover from errors', done => {
      const p = MadPromise(resolve => {
        setTimeout(() => resolve(42), 100);
      });

      p.then(v => v * 2)
        .then(age => {
          name: 'Maarten Hus', age;
        })
        .then(person => {
          return x / 20;
        })
        .catch(e => 1337)
        .then(recoveredValue => {
          expect(recoveredValue).toBe(1337);
          done();
        });
    });
  });

  describe('advanced behavior', () => {
    it('should allow multiple callbacks to the same promise', done => {
      const p = MadPromise(resolve => {
        setTimeout(() => resolve(42), 100);
      });

      let firstResult = null;
      let secondResult = null;

      p.then(v => (firstResult = v));
      p.then(v => (secondResult = v));

      setTimeout(() => {
        expect(firstResult).toBe(42);
        expect(secondResult).toBe(42);
        done();
      }, 150);
    });

    it('should when the promise is already resolved still allow the promise to be consumed', done => {
      const p = MadPromise(resolve => {
        resolve(42);
      });

      p.then(v => {
        expect(v).toBe(42);
        done();
      });
    });

    it('should when the promise is already rejected still allow the promise to be consumed', done => {
      const p = MadPromise((resolve, reject) => {
        reject(42);
      });

      p.catch(v => {
        expect(v).toBe(42);
        done();
      });
    });

    it('should handle promise callbacks in a deterministic manner, to prevent race condition bugs', done => {
      const log = [];

      log.push('a');
      const p = MadPromise(resolve => {
        log.push('b');
        resolve(42);
      });

      p.then(v => {
        log.push('c');
        expect(log).toEqual(['a', 'b', 'd', 'c']);
        done();
      });

      log.push('d');
    });

    it('should only allow a state transitions to "RESOLVED" to occur once, to prevent strange bugs', done => {
      try {
        const p = MadPromise(resolve => {
          resolve(42);
          resolve(1337);
        });
      } catch (e) {
        expect(e.message).toBe('Promise cannot be resolved twice');
        done();
      }
    });

    it('should only allow a state transitions to "REJECTED" to occur once, to prevent strange bugs', done => {
      try {
        const p = MadPromise((resolve, reject) => {
          reject(42);
          reject(1337);
        });
      } catch (e) {
        expect(e.message).toBe('Promise cannot be rejected twice');
        done();
      }
    });

    describe('when then / catch callbacks return promises', () => {
      describe('RESOLVED', () => {
        it('should when return promise is resolved continue with promise result', done => {
          const p = MadPromise(resolve => {
            setTimeout(() => resolve(42), 100);
          });

          p.then(v => {
            return MadPromise(resolve => resolve(1337));
          }).then(v => {
            expect(v).toBe(1337);
            done();
          });
        });

        it('should when return promise is rejected reject with promise result', done => {
          const p = MadPromise(resolve => {
            setTimeout(() => resolve(42), 100);
          });

          p.then(v => {
            return MadPromise((resolve, reject) => reject(1337));
          }).catch(v => {
            expect(v).toBe(1337);
            done();
          });
        });
      });

      describe('REJECTED', () => {
        it('should when return promise is resolved recover with promise result', done => {
          const p = MadPromise((resolve, reject) => {
            setTimeout(() => reject(42), 100);
          });

          p.catch(v => {
            return MadPromise(resolve => resolve(1337));
          }).then(v => {
            expect(v).toBe(1337);
            done();
          });
        });

        it('should when return promise is rejected reject with promise result', done => {
          const p = MadPromise((resolve, reject) => {
            setTimeout(() => reject(42), 100);
          });

          p.catch(v => {
            return MadPromise((resolve, reject) => reject(1337));
          }).catch(v => {
            expect(v).toBe(1337);
            done();
          });
        });
      });
    });
  });
});