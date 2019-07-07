import React, { Component } from "react";
import i18n from "@dhis2/d2-i18n";
import { withFeedback } from "../feedback";
import { TextField } from "material-ui";
import OUTreeSelect from "./OUTreeSelect";
import Button from "@material-ui/core/Button";
import SaveIcon from "@material-ui/icons/Save";
import ClearIcon from "@material-ui/icons/Clear";
import Paper from "@material-ui/core/Paper";

class OUMapForm extends Component {
    render() {
        const { mapping } = this.props;
        return (
            <Paper spacing={2}>
                <form onSubmit={this.props.saveMapping}>
                    <span>{i18n.t("Alternative Name : ")}</span>
                    <TextField
                        id="alternativeName"
                        required
                        margin="normal"
                        hintText={i18n.t("Type alternative name...")}
                        value={mapping.alternativeName}
                        onChange={this.props.onChange}
                    />
                    <span>{i18n.t("Organisation Unit : ")}</span>
                    <OUTreeSelect
                        id="organisationUnit"
                        d2={this.props.d2}
                        onChange={this.props.handleTreeChange}
                        value={mapping.orgUnitName}
                    />
                    <Button variant="contained" color="primary" type="submit">
                        <SaveIcon />
                        {i18n.t("Add Mapping...")}
                    </Button>
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={this.props.clearSelection}
                    >
                        <ClearIcon />
                        {i18n.t("Clear")}
                    </Button>
                </form>
            </Paper>
        );
    }
}
export default withFeedback(OUMapForm);
