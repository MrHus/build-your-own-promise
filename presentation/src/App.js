import React, { Component } from 'react';

import Visualizer from './ui/Visualizer';
import Editor from './ui/Editor';
import Error from './ui/Error';

import { MadPromise, resetName } from './MadPromise';

import '../node_modules/animate.css';

import simpleThen from './examples/simple-then';
import simpleCatch from './examples/simple-catch';
import thenChain from './examples/then-chain';
import thenChainSingleCatch from './examples/then-chain-single-catch';
import thenChainErrorInThen from './examples/then-chain-error-in-then';
import errorRecovery from './examples/error-recovery';
import promiseChain from './examples/promise-chain';
import promiseChainWithErrors from './examples/promise-chain-with-errors';
import complexTree from './examples/complex-tree';
import deterministicOrder from './examples/deterministic-order';
import promiseCache from './examples/promise-cache';

const examples = [
  { name: 'Simple then', code: simpleThen },
  { name: 'Simple catch', code: simpleCatch },
  { name: 'Then chain', code: thenChain },
  { name: 'Then chain catching errors', code: thenChainSingleCatch },
  { name: 'Then chain error in then', code: thenChainErrorInThen },
  { name: 'Error recovery', code: errorRecovery },
  { name: 'Deterministic order', code: deterministicOrder },
  { name: 'Promises are cachable', code: promiseCache },
  { name: 'Promise chain', code: promiseChain },
  { name: 'Promise chain with errors', code: promiseChainWithErrors },
  { name: 'Complex tree', code: complexTree }
];

const EDITOR_WIDTH = 550;

export default class App extends Component {
  state = {
    code: simpleThen,
    visualizerWidth: 0,
    hasError: false,
    showEditor: true
  };

  onSelectExample(index) {
    // Hide the editor temporarily so it renders with the new code.
    this.setState({ showEditor: false });

    this.executeCode(examples[index].code);

    setTimeout(() => {
      this.setState({ showEditor: true });
    }, 200);
  }

  executeCode(code) {
    // First set the code to blank to hide the current visualization
    this.setState({ code: '', hasError: false });

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
      <div className="IDE">
        <div className="card" style={{ width: EDITOR_WIDTH, float: 'left' }}>
          <span className="card-title">CODE</span>
          <div className="select-wrapper">
            <select
              className="select"
              onChange={event => this.onSelectExample(event.target.value)}
            >
              {examples.map((example, index) => (
                <option key={index} value={index}>
                  {example.name}
                </option>
              ))}
            </select>
          </div>
          {this.state.showEditor ? (
            <Editor
              width={EDITOR_WIDTH}
              code={this.state.code}
              onExecute={code => this.executeCode(code)}
            />
          ) : null}
        </div>
        <div
          ref={node => this.calculateWidthForVisualizer(node)}
          style={{ width: `calc(100% - ${EDITOR_WIDTH + 20}px)` }}
        >
          {this.state.hasError ? <Error/> : this.renderVisualizer()}
        </div>
      </div>
    );
  }

  renderVisualizer() {
    if (this.state.visualizerWidth === 0 || this.state.code === '') {
      return null;
    }

    return (
      <Visualizer
        width={this.state.visualizerWidth}
        code={this.state.code}
        chain={(visualize, LOGGER) => {
          // Make MadPromise available under window, because webpack
          // rewrites the name.
          window.MadPromise = MadPromise;

          // Make the visualize available on the MadPromise so it can use it.
          window.MadPromise.visualize = visualize;

          // Reset the name generator or the promise.
          resetName();

          try {
            eval(this.state.code);
          } catch (error) {
            console.error(error);
            this.setState({ hasError: true });
          }
        }}
      />
    );
  }
}
