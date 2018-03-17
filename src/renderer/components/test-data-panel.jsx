import React, { Component, PropTypes } from 'react';
import { tablesToCards } from './test-tables-to-cards.jsx';
import NumericConfig, { numericOptions } from './numeric/index.jsx';
import BooleanConfig, { booleanOptions } from './boolean/index.jsx';
import CharacterConfig, { characterOptions } from './character/index.jsx';
import JsonConfig, { jsonOptions } from './json/index.jsx';
import TimestampConfig, { timestampOptions } from './timestamp/index.jsx';
import { Slider } from '@blueprintjs/core';
import { testGenerator } from './generic/test-generator.js';
require('./test-schema-panel.css');

const DEFAULT_GENERATOR = { name: '', func: null, inputs: [], testResults: [] };

function typesToOptions(typeList) {
  return typeList.map(typ => (
    <option key={typ} value={typ}>
      {typ}
    </option>
  ));
}

function dataConfig(schemaInfo, onSetField, tableIndex, fieldIndex) {
  if (!schemaInfo) {
    return <div />;
  }
  const configuredField = schemaInfo[tableIndex][1][fieldIndex];
  const supportedTypes = ['integer', 'character', 'timestamp', 'numeric', 'json', 'boolean'];
  let currentType = supportedTypes.find(typ => configuredField.mappedType.includes(typ))
    ? configuredField.mappedType
    : configuredField.configuredType;
  const notConfigurable = configuredField.index || configuredField.fk;
  //   const relations = tableRelations(schemaInfo);
  //   const currentTarget =
  //     configuredField.foreignTarget === null ? 'null' : JSON.stringify(configuredField.foreignTarget);
  let dataGenOptions = [];
  let dataGenConfigs = <div />;
  if (currentType.includes('integer') || currentType.includes('numeric')) {
    dataGenOptions = numericOptions;
    dataGenConfigs = (
      <NumericConfig
        schemaInfo={schemaInfo}
        onSetField={onSetField}
        generatorName={configuredField.generator.name}
        tableIndex={tableIndex}
        fieldIndex={fieldIndex}
        isInteger={currentType.includes('integer')}
      />
    );
  } else if (currentType.includes('boolean')) {
    dataGenOptions = booleanOptions;
    dataGenConfigs = (
      <BooleanConfig
        schemaInfo={schemaInfo}
        onSetField={onSetField}
        generatorName={configuredField.generator.name}
        tableIndex={tableIndex}
        fieldIndex={fieldIndex}
      />
    );
  } else if (currentType.includes('character')) {
    dataGenOptions = characterOptions;
    dataGenConfigs = (
      <CharacterConfig
        schemaInfo={schemaInfo}
        onSetField={onSetField}
        generatorName={configuredField.generator.name}
        tableIndex={tableIndex}
        fieldIndex={fieldIndex}
      />
    );
  } else if (currentType.includes('json')) {
    dataGenOptions = jsonOptions;
    dataGenConfigs = (
      <JsonConfig
        schemaInfo={schemaInfo}
        onSetField={onSetField}
        generatorName={configuredField.generator.name}
        tableIndex={tableIndex}
        fieldIndex={fieldIndex}
      />
    );
  } else if (currentType.includes('timestamp')) {
    dataGenOptions = timestampOptions;
    dataGenConfigs = (
      <TimestampConfig
        schemaInfo={schemaInfo}
        onSetField={onSetField}
        generatorName={configuredField.generator.name}
        tableIndex={tableIndex}
        fieldIndex={fieldIndex}
      />
    );
  }
  return (
    <div key={JSON.stringify([tableIndex, fieldIndex])}>
      <h2>{`${schemaInfo[tableIndex][0]}.${configuredField.name}`}</h2>

      {supportedTypes.find(typ => configuredField.mappedType.includes(typ)) ? (
        <div />
      ) : (
        <h4>
          {currentType === ''
            ? 'Please configure type in Schema tab'
            : `Configured as: ${currentType}`}
        </h4>
      )}

      {notConfigurable ? <h4>Index and Foreign key fields are autogenerated.</h4> : <div />}

      {configuredField.index || configuredField.pk || !configuredField.nullable ? (
        <div />
      ) : (
        <div>
          <h5>Configure Null Rate</h5>
          <div style={{ marginLeft: '20px', marginRight: '20px' }}>
            <Slider
              min={0}
              max={1}
              stepSize={0.01}
              labelStepSize={0.2}
              onChange={e => onSetField(tableIndex, fieldIndex, 'nullRate', e)}
              value={configuredField.nullRate}
              vertical={false}
            />
          </div>
        </div>
      )}

      {notConfigurable || currentType === '' ? (
        <div />
      ) : (
        <div>
          <div key={currentType} className="pt-select" style={{ marginBottom: '5px' }}>
            <select
              defaultValue={configuredField.generator.name}
              onChange={e =>
                onSetField(tableIndex, fieldIndex, 'generator', {
                  ...DEFAULT_GENERATOR,
                  name: e.target.value,
                })
              }
            >
              <option value="">Select Data Generator...</option>
              {typesToOptions(dataGenOptions)}
            </select>
          </div>
          <span style={{ position: 'relative', top: '-2px', left: '5px' }}>
            {configuredField.generator.name === '' ? <div /> : dataGenConfigs}
          </span>
        </div>
      )}
      {notConfigurable || configuredField.generator.name === '' ? (
        <div />
      ) : (
        <div>
          {!configuredField.generator.func ? (
            <div />
          ) : (
            <button
              type="button"
              className="pt-button pt-icon-play"
              onClick={() =>
                onSetField(
                  tableIndex,
                  fieldIndex,
                  'generator',
                  testGenerator(
                    configuredField.generator,
                    configuredField.nullable,
                    configuredField.nullRate
                  )
                )
              }
            >
              Generate Sample
            </button>
          )}
          <div>{JSON.stringify(configuredField.generator.testResults)}</div>
        </div>
      )}
    </div>
  );
}

class TestDataPanel extends Component {
  static propTypes = {
    schemaInfo: PropTypes.array,
    onSetField: PropTypes.func.isRequired,
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      activeTableIndex: 0,
      activeFieldIndex: 0,
    };
  }

  setTableAndField(activeTableIndex, activeFieldIndex) {
    this.setState({ activeTableIndex, activeFieldIndex });
  }

  render() {
    const { schemaInfo, onSetField } = this.props;
    const { activeFieldIndex, activeTableIndex } = this.state;

    return (
      <div className="schema-panel-container">
        <div className="schema-table-slider">
          {tablesToCards(schemaInfo, activeTableIndex, activeFieldIndex, ::this.setTableAndField)}
        </div>
        <div className="schema-table-config">
          {dataConfig(schemaInfo, onSetField, activeTableIndex, activeFieldIndex)}
        </div>
      </div>
    );
  }
}

export default TestDataPanel;
