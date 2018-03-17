import React, { Component, PropTypes } from 'react';
import { Modal } from 'react-bootstrap';
import faker from 'faker';

function userNameGenerator(randNum, [maxLength]) {
  const seed = randNum * Number.MAX_SAFE_INTEGER;
  faker.seed(seed);
  const result = faker.internet.userName();
  return result.length > maxLength ? result.slice(0, maxLength) : result;
}

const USER_NAME = 'Username';

class UserName extends Component {
  static propTypes = {
    schemaInfo: PropTypes.array.isRequired,
    onSetField: PropTypes.func.isRequired,
    tableIndex: PropTypes.number.isRequired,
    fieldIndex: PropTypes.number.isRequired,
    handleClose: PropTypes.func.isRequired,
  };

  constructor(props, context) {
    super(props, context);
    const { schemaInfo, tableIndex, fieldIndex } = props;
    let defaultInput = schemaInfo[tableIndex][1][fieldIndex].generator.inputs;
    if (defaultInput.length !== 1) {
      defaultInput = [255];
    }
    this.state = {
      maxLength: defaultInput[0],
    };
  }

  setMaxLength(maxLength) {
    this.setState({ maxLength });
  }

  render() {
    const { onSetField, tableIndex, fieldIndex, handleClose } = this.props;
    const { maxLength } = this.state;
    const compressedInput = [maxLength];
    return (
      <div>
        <Modal.Body>
          <label className="pt-label">
            Select Max String Length
            <input
              type="number"
              style={{ marginRight: '13px' }}
              className="pt-input pt-numeric-input"
              onChange={e => this.setMaxLength(parseInt(e.target.value, 10))}
              value={maxLength}
            />
          </label>
        </Modal.Body>
        <Modal.Footer>
          <button
            type="button"
            className="pt-button pt-intent-primary"
            onClick={() => {
              onSetField(tableIndex, fieldIndex, 'generator', {
                func: userNameGenerator,
                inputs: compressedInput,
                name: USER_NAME,
              });
              handleClose();
            }}
          >
            Save
          </button>
          <button type="button" className="pt-button" onClick={handleClose}>
            Close
          </button>
        </Modal.Footer>
      </div>
    );
  }
}

export default UserName;
export { USER_NAME, userNameGenerator };
