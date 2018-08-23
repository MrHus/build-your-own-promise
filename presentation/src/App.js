import React, { Component } from 'react';

import Visualizer from './ui/Visualizer';

import { MadPromise } from './MadPromise';

export default class App extends Component {
  render() {
    return (
      <Visualizer
        chain={visualize => {
          const a = MadPromise(visualize, resolve => {
            setTimeout(() => {
              resolve(1);
            }, 2000);
          });

          const b = a.then(() => {
            return MadPromise(null, resolve => {
              setTimeout(() => {
                resolve(2);
              }, 2000);
            });
          });

          const c = a.then(() => {
            return MadPromise(null, resolve => {
              setTimeout(() => {
                resolve(3);
              }, 2000);
            });
          });

          const b1 = b.then(() => {
            return MadPromise(null, resolve => {
              setTimeout(() => {
                resolve(4);
              }, 2000);
            });
          });

          const b2 = b.then(() => {
            return MadPromise(null, resolve => {
              setTimeout(() => {
                resolve(5);
              }, 2000);
            });
          });

          const b3 = b.then(() => {
            return MadPromise(null, resolve => {
              setTimeout(() => {
                resolve(6);
              }, 2000);
            });
          });

          const b21 = b2.then(() => {
            return MadPromise(null, resolve => {
              setTimeout(() => {
                resolve(7);
              }, 2000);
            });
          });

          const b22 = b2.then(() => {
            return MadPromise(null, resolve => {
              setTimeout(() => {
                resolve(8);
              }, 2000);
            });
          });
        }}
      />
    );
  }
}
