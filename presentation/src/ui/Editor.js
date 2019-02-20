import React, { Component } from 'react';

import AceEditor from 'react-ace';

import 'brace/mode/javascript';
import 'brace/theme/tomorrow';

export default class Editor extends Component {
  state = {
    code: this.props.code
  };

  codeChanged(code) {
    this.setState({ code });
  }

  executeClicked() {
    this.props.onExecute(this.state.code);
  }

  render() {
    return (
      <div>
        <AceEditor
          mode="javascript"
          theme="tomorrow"
          onChange={code => this.codeChanged(code)}
          name="UNIQUE_ID_OF_DIV"
          fontSize={16}
          height="calc(100vh - 200px)"
          width="550px"
          value={this.state.code}
          editorProps={{ $blockScrolling: true }}
        />
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button className="button" onClick={() => this.executeClicked()}>
            Execute
          </button>
        </div>
      </div>
    );
  }
}
