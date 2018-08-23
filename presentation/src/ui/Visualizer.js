import React, { Component } from 'react';
import * as d3 from 'd3';

const width = 1400;
const height = 700;

const treeCreator = d3.tree().size([width, height - 100]);

export default class Visualizer extends Component {
  state = {
    tree: null
  };

  componentDidMount() {
    let data = null;

    const updateTree = this.updateTree.bind(this);

    function visualize(node) {
      if (!node.children) {
        node.children = [];
      }

      // The first node becomes the root node.
      if (data === null) {
        data = node;
      } else {
        const childNode = find(data, node.name);

        // If the child has not been added yet add it to the parent.
        if (childNode === false) {
          const parentNode = find(data, node.parent);
          parentNode.children.push(node);
        } else {
          // Simply update the status.
          childNode.status = node.status;
          childNode.value = node.value;
        }
      }

      updateTree(data);
    }

    this.props.chain(visualize);
  }

  updateTree(data) {
    const root = d3.hierarchy(data);
    const tree = treeCreator(root);

    this.setState({ tree });
  }

  render() {
    if (!this.state.tree) {
      return null;
    }

    return (
      <svg
        width={width}
        height={height}
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

      return (
        <g className="node" key={node.data.name} transform={transform}>
          <circle r="25" strokeWidth="2" fill={color(node.data.status)} />

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
            stroke="#ccc"
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
