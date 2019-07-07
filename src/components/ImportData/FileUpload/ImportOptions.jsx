/**
 * --------------------------------------------------------------------------------------
 * preheatCache         false | true
 * --------------------------------------------------------------------------------------
 * Indicates whether to preload metadata caches before starting to
 * import data values, will speed up large import payloads with high
 * metadata cardinality.
 *
 * --------------------------------------------------------------------------------------
 * dryRun               false | true
 * --------------------------------------------------------------------------------------
 * Whether to save changes on the server or just return the import summary.
 *
 * --------------------------------------------------------------------------------------
 * importStrategy       CREATE | UPDATE | CREATE_AND_UPDATE | DELETE
 * --------------------------------------------------------------------------------------
 * Save objects of all, new or update import status on the server.
 *
 * --------------------------------------------------------------------------------------
 * skipExistingCheck    false | true
 * --------------------------------------------------------------------------------------
 * Skip checks for existing data values. Improves performance.
 * Only use for empty databases or when the data values to import do not exist already.
 *
 *
 */
import React, { Component } from "react";
import SelectField from "material-ui/SelectField";
import Checkbox from "material-ui/Checkbox";
import MenuItem from "material-ui/MenuItem";

import { IMPORT_STRATEGY_TYPES } from "../Constants";
export default class ImportOptions extends Component {
    toggleCheckBox = e => {
        const { options } = this.props;
        options[e.target.name] = e.target.checked;
        this.props.onChange(options);
        // this.setState({ importOptions });
    };
    handleSelectChange = (evt, key, payload) => {
        const { options } = this.props;
        options["importStrategy"] = payload;
        // this.setState({ importOptions });
        this.props.onChange(options);
    };
    getListItems = () =>
        IMPORT_STRATEGY_TYPES.map(ds => (
            <MenuItem key={ds + ""} value={ds + ""} primaryText={ds + ""} />
        ));
    render() {
        const { options } = this.props;
        return (
            <div>
                <Checkbox
                    name="preheatCache"
                    label="Pre-heat Cache"
                    onCheck={this.toggleCheckBox}
                    checked={options.preheatCache}
                />
                <br />
                <Checkbox
                    name="skipExistingCheck"
                    label="Skip Existing Check (Only For empty DB)"
                    onCheck={this.toggleCheckBox}
                    checked={options.skipExistingCheck}
                />
                <br />
                <Checkbox
                    name="dryRun"
                    label="Dry Run (preview only)"
                    onCheck={this.toggleCheckBox}
                    checked={options.dryRun}
                />
                <br />
                <SelectField
                    name="importStrategy"
                    floatingLabelText="Select Import Strategy"
                    value={"" + options.importStrategy}
                    onChange={this.handleSelectChange}
                >
                    {this.getListItems()}
                </SelectField>
            </div>
        );
    }
}
