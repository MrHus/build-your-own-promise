import React, { Component, Fragment } from 'react';

import Visualizer from './ui/Visualizer';
import Editor from './ui/Editor';

import { MadPromise, resetName } from './MadPromise';

import '../node_modules/animate.css';

const initialCode = `
const a = MadPromise((resolve, reject) => {
  setTimeout(() => {
    resolve(1);
  }, 2000);
});

const b = a.then(() => {
  return MadPromise(resolve => {
    setTimeout(() => {
      resolve(2);
    }, 2000);
  });
});

const c = a.then(() => {
  return MadPromise(resolve => {
    setTimeout(() => {
      resolve(3);
    }, 2000);
  });
});

const b1 = b.then(() => {
  return MadPromise(resolve => {
    setTimeout(() => {
      resolve(4);
    }, 1000);
  });
});

const b2 = b.then(() => {
  return MadPromise(resolve => {
    setTimeout(() => {
      resolve(5);
    }, 2000);
  });
});

const b3 = b.then(() => {
  return MadPromise(resolve => {
    setTimeout(() => {
      resolve(6);
    }, 3000);
  });
});

const b21 = b2.then(() => {
  return MadPromise(resolve => {
    setTimeout(() => {
      resolve(7);
    }, 2000);
  });
});

const b22 = b2.then(() => {
  return MadPromise(resolve => {
    setTimeout(() => {
      resolve(8);
    }, 2000);
  });
});
`;

const EDITOR_WIDTH = 550;

export default class App extends Component {
  state = {
    code: initialCode,
    visualizerWidth: 0
  };

  executeCode(code) {
    // First set the code to blank to hide the current visualization
    this.setState({ code: '' });

    // Then set the code to trigger re-visualization.
    setTimeout(() => {
      this.setState({ code });
    }, 200);
  }

  calculateWidthForVisualizer(node) {
    if (node) {
      const visualizerWidth = node.clientWidth;

      if (visualizerWidth !== this.state.visualizerWidth) {
        this.setState({ visualizerWidth: node.clientWidth });
      }
    }
  }

  render() {
    return (
      <Fragment>
        <div style={{ width: EDITOR_WIDTH, float: 'left' }}>
          <Editor
            width={EDITOR_WIDTH}
            code={this.state.code}
            onExecute={code => this.executeCode(code)}
          />
        </div>
        <div
          ref={node => this.calculateWidthForVisualizer(node)}
          style={{ width: `calc(100% - ${EDITOR_WIDTH}px)`, float: 'left' }}
        >
          {this.state.visualizerWidth !== 0 && this.state.code !== '' ? (
            <Visualizer
              width={this.state.visualizerWidth}
              code={this.state.code}
              chain={visualize => {
                // Make MadPromise available under window, because webpack
                // rewrites the name.
                window.MadPromise = MadPromise;

                // Make the visualize available on the MadPromise so it can use it.
                window.MadPromise.visualize = visualize;

                // Reset the name generator or the promise.
                resetName();

                eval(this.state.code);
              }}
            />
          ) : null}
        </div>
      </Fragment>
    );
  }
}
