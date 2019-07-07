import React, { Component } from "react";
import OUMapForm from "./OUMapForm";
import { withFeedback, levels } from "../feedback";
import { MAPPING_KEY, API_VERSION } from "../ImportData/Constants";
import i18n from "@dhis2/d2-i18n";
import {
    Table,
    TableRow,
    TableHeader,
    TableHeaderColumn,
    TableRowColumn,
    TableBody,
    RaisedButton,
} from "material-ui";
import XLSX from "xlsx";

class OUMapList extends Component {
    state = {
        mappings: [],
        mapping: { Id: "", orgUnitId: "", orgUnitName: "", alternativeName: "" },
        selected: [],
    };

    componentWillMount = async () => {
        await this.fetchAllMaps(MAPPING_KEY, this.createNewMappingSetting);
        this.clearSelection();
    };
    fetchAllMaps = async (mappingKey = MAPPING_KEY, cb = this.createNewMappingSetting) => {
        try {
            const api = this.props.d2.Api.getApi();
            await api.get(`${API_VERSION}/systemSettings`).then(r => {
                if (r[mappingKey]) {
                    let mappings = JSON.parse(r[mappingKey]);
                    this.setState({ mappings: mappings[mappingKey] });
                } else {
                    console.warn(`NO Key found in the setting... Creating One for ${mappingKey}`);
                    this.setState({ mappings: [] });
                    cb(mappingKey);
                }
            });
        } catch (e) {
            console.log("Error in getting OU Mappings");
            console.log(e);
        }
    };
    createNewMappingSetting = async (mappingKey = MAPPING_KEY) => {
        try {
            const api = this.props.d2.Api.getApi();
            const requestOptions = {
                headers: {
                    "Content-Type": "text/plain",
                },
            };
            const payload = [];
            const oUmappings = payload;
            const dataMap = {};
            dataMap[mappingKey] = oUmappings;
            await api
                .post(
                    `${API_VERSION}/systemSettings/${mappingKey}`,
                    JSON.stringify(dataMap),
                    requestOptions
                )
                .then(res => console.log("Pushing data successfully" + JSON.stringify(res)));
        } catch (e) {
            console.log("Creating OU Mapping Key failed");
            console.log(e);
        }
    };
    saveMappingSetting = async (payload, mappingKey = MAPPING_KEY) => {
        try {
            const api = this.props.d2.Api.getApi();
            const requestOptions = {
                headers: {
                    "Content-Type": "text/plain",
                },
            };
            const oUmappings = payload;
            const dataMap = {};
            dataMap[mappingKey] = oUmappings;
            await api
                .post(
                    `${API_VERSION}/systemSettings/${mappingKey}`,
                    JSON.stringify(dataMap),
                    requestOptions
                )
                .then(res => console.log("Pushing data complete with status:" + res["status"]));
        } catch (e) {
            console.log("Saving OU Mapping Key failed");
            console.log(e);
        }
    };
    rowDeleteHandle = mapping => {
        if (window.confirm("Are you sure you want to delete the record?")) {
            const { mappings } = this.state;
            let mps = mappings.filter(m => m.Id !== mapping.Id);
            this.setState({ mappings: mps });
            this.saveMappingSetting(mps);
            this.props.feedback(
                levels.WARNING,
                i18n.t("Mapping deleted: " + mapping.alternativeName)
            );
        }
    };
    rowClickHandle = mapping => {
        this.setState({ mapping });
        const m = this.state.mapping;
        console.log(m);
        this.props.feedback(levels.INFO, i18n.t("Mapping selected: " + mapping.alternativeName));
    };
    textBoxOnChange = e => {
        let { mapping } = this.state;
        mapping.alternativeName = e.target.value;
        this.setState({ mapping });
    };
    handleTreeChange = (selectedOUpath, selectedOUNames) => {
        const orgUnitId = selectedOUpath
            ? selectedOUpath.substr(selectedOUpath.lastIndexOf("/") + 1)
            : "";
        const orgUnitName = selectedOUpath ? selectedOUNames[0] : "";
        let { mapping } = this.state;
        mapping.orgUnitId = orgUnitId;
        mapping.orgUnitName = orgUnitName;
        this.setState({ mapping });
    };
    isValidMapping = mapping => {
        let isIncomplete = mapping.Id.startsWith("@") || mapping.Id.endsWith("@");
        mapping.Id.startsWith("@") &&
            this.props.feedback(
                levels.ERROR,
                i18n.t("Alternative Name value cannot be empty! Please enter one and try again")
            );
        mapping.Id.endsWith("@") &&
            this.props.feedback(
                levels.ERROR,
                i18n.t(
                    "Mapping Organisation Unit value cannot be empty! Please select one and try again"
                )
            );

        return !isIncomplete;
    };
    handleSaveMapping = e => {
        const { mapping } = this.state;
        const isEditing = mapping.Id.length !== "";
        const Id = mapping.alternativeName.trim() + "@" + mapping.orgUnitId.trim();
        mapping.Id = Id;
        if (this.isValidMapping(mapping, isEditing)) {
            this.setState({ mapping });

            let mappings = this.state.mappings.filter(m => m.Id !== mapping.Id);

            mappings.push(this.state.mapping);

            this.setState({ mappings });

            this.saveMappingSetting(mappings);
            this.clearSelection();
            this.props.feedback(
                levels.SUCCESS,
                i18n.t(
                    `Mapping Saved Successfully! Mapped ${
                        this.state.mapping.alternativeName
                    } to OU ${this.state.mapping.orgUnitName}`
                )
            );
        }
        e.preventDefault();
    };
    clearSelection = e => {
        if (e) e.preventDefault();
        this.setState({ mapping: { Id: "", orgUnitId: "", orgUnitName: "", alternativeName: "" } });
    };
    exportMappings = e => {
        e.preventDefault();
        const mappings = this.state.mappings.length > 0 ? this.state.mappings : [];
        var data = [["#Id", "Alternative Name", "OrgUnit Id", "OrgUnit Name"]];
        mappings.forEach(element => {
            let row = [element.Id, element.alternativeName, element.orgUnitId, element.orgUnitName];
            data.push(row);
        });
        var filename = "OU Mappings Data.xlsx";
        var ws_name = "Data";

        var wb = XLSX.utils.book_new(),
            ws = XLSX.utils.aoa_to_sheet(data);

        XLSX.utils.book_append_sheet(wb, ws, ws_name);

        XLSX.writeFile(wb, filename);
    };

    render() {
        const { d2 } = this.props;
        const { mapping } = this.state;
        const mappings = this.state.mappings.length > 0 ? this.state.mappings : [];
        return (
            <React.Fragment>
                <OUMapForm
                    d2={d2}
                    mapping={mapping}
                    onChange={this.textBoxOnChange}
                    handleTreeChange={this.handleTreeChange}
                    saveMapping={this.handleSaveMapping}
                    clearSelection={e => this.clearSelection(e)}
                />
                <Table rowHeight={15}>
                    <TableHeader>
                        <TableRow>
                            <TableHeaderColumn>
                                <RaisedButton
                                    primary
                                    label="Export to XLSX"
                                    onClick={this.exportMappings}
                                />
                            </TableHeaderColumn>
                            <TableHeaderColumn>{i18n.t("Alternative Name")}</TableHeaderColumn>
                            <TableHeaderColumn>{i18n.t("OrgUnit Id")}</TableHeaderColumn>
                            <TableHeaderColumn>{i18n.t("OrgUnit Name")}</TableHeaderColumn>
                            <TableHeaderColumn>{i18n.t("Actions")}</TableHeaderColumn>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mappings.map(m => {
                            return (
                                <TableRow key={m.Id}>
                                    <TableRowColumn>{m.Id}</TableRowColumn>
                                    <TableRowColumn>{m.alternativeName}</TableRowColumn>
                                    <TableRowColumn>{m.orgUnitId}</TableRowColumn>
                                    <TableRowColumn>{m.orgUnitName}</TableRowColumn>
                                    <TableRowColumn>
                                        <button size="small" onClick={e => this.rowClickHandle(m)}>
                                            <span>{i18n.t("Edit")}</span>
                                        </button>
                                        <button size="small" onClick={e => this.rowDeleteHandle(m)}>
                                            <span>{i18n.t("Delete")}</span>
                                        </button>
                                    </TableRowColumn>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </React.Fragment>
        );
    }
}
export default withFeedback(OUMapList);
