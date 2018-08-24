import React, { Component, Fragment } from 'react';
import * as d3 from 'd3';

const height = 700;

export default class Visualizer extends Component {
  state = {
    tree: null,
    log: []
  };

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
      const logItem = { ...promise };

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

      const treeCreator = d3.tree().size([self.props.width, height - 100]);
      const root = d3.hierarchy(data);
      const tree = treeCreator(root);

      // But ugly directly manipulating the state but otherwise we get timing errors.
      self.state.log.push(logItem);

      self.setState({ tree, log: self.state.log });
    }

    this.props.chain(visualize);
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
        <svg
          width={this.props.width}
          height={height}
          style={{ display: 'block', margin: 'auto' }}
        >
          <g>{this.renderLinks()}</g>
          <g>{this.renderNodes()}</g>
        </svg>
        {this.renderLog()}
      </Fragment>
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
    return (
      <ul ref={node => this.scrollDown(node)} className="log">
        {this.state.log.map(promise => {
          const value =
            promise.status !== 'PENDING' ? ` with value: ${promise.value}` : '';

          return (
            <li key={`${promise.name}-${promise.status}`}>
              {promise.time.toLocaleTimeString()}: <b>{promise.name}</b> -{' '}
              <span style={{ color: color(promise.status) }}>
                {promise.status}
              </span>

              {value}
            </li>
          );
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
    return 'green';
  } else {
    return 'red';
  }
}
