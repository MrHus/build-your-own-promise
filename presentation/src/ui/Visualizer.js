import React, { Component, Fragment } from 'react';
import * as d3 from 'd3';

const consoleHeight = 200;

export default class Visualizer extends Component {
  state = {
    tree: null,
    log: []
  };

  // 114 is a magic number to make everything fit :P
  graphHeight = window.innerHeight - consoleHeight - 114;

  componentDidMount() {
    this.execute();
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.code !== this.props.code ||
      prevProps.width !== this.props.width
    ) {
      this.execute();
    }
  }

  execute() {
    this.setState({ tree: null, log: [] });

    let data = null;

    let chainId = null;

    const self = this;

    function visualize(promise) {
      // Create a copy of the node for the log.
      const logItem = { promise: { ...promise }, type: 'promise' };

      if (!promise.children) {
        promise.children = [];
      }

      // The first node becomes the root node.
      if (data === null) {
        data = promise;
        chainId = promise.chainId;
      } else {
        // Ignore chains we are not currently visualizing.
        if (chainId !== promise.chainId) {
          return;
        }

        const currentPromise = find(data, promise.name);

        // If the child has not been added yet add it to the parent.
        if (currentPromise === false) {
          const parentPromise = find(data, promise.parent);

          parentPromise.children.push(promise);
        } else {
          // Simply update the status.
          currentPromise.status = promise.status;
          currentPromise.value = promise.value;
        }
      }

      const treeCreator = d3
        .tree()
        .size([self.props.width, self.graphHeight - 100]);
      const root = d3.hierarchy(data);
      const tree = treeCreator(root);

      // But ugly directly manipulating the state but otherwise we get timing errors.
      self.state.log.push(logItem);

      self.setState({ tree, log: self.state.log });
    }

    function info(message) {
      // But ugly directly manipulating the state but otherwise we get timing errors.
      self.state.log.push({ type: 'console', message, level: 'info' });

      self.setState({ log: self.state.log });
    }

    function error(message) {
      // But ugly directly manipulating the state but otherwise we get timing errors.
      self.state.log.push({ type: 'console', message, level: 'error' });

      self.setState({ log: self.state.log });
    }

    this.props.chain(visualize, { info, error });
  }

  scrollDown(node) {
    if (node) {
      node.scrollTop = node.scrollHeight;
    }
  }

  render() {
    if (!this.state.tree) {
      return null;
    }

    return (
      <Fragment>
        <div className="card">
          <span className="card-title">GRAPH</span>
          {this.renderGraph()}
        </div>

        <div className="card">
          <span className="card-title">CONSOLE</span>
          {this.renderLog()}
        </div>
      </Fragment>
    );
  }

  renderGraph() {
    return (
      <svg
        width={this.props.width}
        height={this.graphHeight}
        style={{ display: 'block', margin: 'auto' }}
      >
        <g>{this.renderLinks()}</g>
        <g>{this.renderNodes()}</g>
      </svg>
    );
  }

  renderNodes() {
    return this.state.tree.descendants().map(node => {
      const transform = `translate(${node.x},${node.y + 50})`;

      const className =
        node.data.status === 'PENDING' ? '' : 'animated rubberBand';

      return (
        <g className="node" key={node.data.name} transform={transform}>
          <circle
            className={className}
            r="25"
            strokeWidth="2"
            fill={color(node.data.status)}
          />

          <text textAnchor="middle" fill="white" dy=".3em">
            {node.data.name}
          </text>

          <text x="30" dy=".35em">
            {node.data.value === undefined
              ? 'undefined'
              : JSON.stringify(node.data.value)}
          </text>
        </g>
      );
    });
  }

  renderLinks() {
    return this.state.tree.links().map(link => {
      return (
        <g key={`${link.source.data.name}-${link.target.data.name}`}>
          <defs>
            <defs>
              <marker
                id="arrow"
                markerWidth="30"
                markerHeight="30"
                refX="25"
                refY="3"
                orient="auto"
                markerUnits="strokeWidth"
                viewBox="0 0 20 20"
              >
                <path d="M0,0 L0,6 L9,3 z" fill="black" />
              </marker>
            </defs>
          </defs>
          <line
            stroke={color(link.source.data.status)}
            strokeWidth={link.size}
            x1={link.source.x}
            x2={link.target.x}
            y1={link.source.y + 50}
            y2={link.target.y + 50}
            markerEnd="url(#arrow)"
          />
        </g>
      );
    });
  }

  renderLog() {
    const animation = 'animated slideInLeft';

    return (
      <ul ref={node => this.scrollDown(node)} className="log">
        {this.state.log.map((logItem, index) => {
          if (logItem.type === 'console') {
            return (
              <li key={index} className={animation}>
                {new Date().toLocaleTimeString()}: {logItem.level.toUpperCase()}{' '}
                {JSON.stringify(logItem.message)}
              </li>
            );
          } else {
            const promise = logItem.promise;

            const value =
              promise.status !== 'PENDING'
                ? ` ${JSON.stringify(promise.value)}`
                : '';

            return (
              <li key={index} className={animation}>
                {promise.time.toLocaleTimeString()}: <b>({promise.name})</b> -{' '}
                <span style={{ color: color(promise.status) }}>
                  {promise.status}
                </span>
                {value}
              </li>
            );
          }
        })}
      </ul>
    );
  }
}

function find(data, name) {
  if (data.name === name) {
    return data;
  }

  if (data.children === undefined || data.children.length === 0) {
    return false;
  }

  for (let child of data.children) {
    const found = find(child, name);

    if (found !== false) {
      return found;
    }
  }

  return false;
}

function color(status) {
  if (status === 'PENDING') {
    return 'steelblue';
  } else if (status === 'RESOLVED') {
    return 'limegreen';
  } else {
    return 'crimson';
  }
}
