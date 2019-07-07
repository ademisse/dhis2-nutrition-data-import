import React, { Component } from "react";
import i18n from "@dhis2/d2-i18n";
import {
    Table,
    TableRow,
    TableHeader,
    TableHeaderColumn,
    TableRowColumn,
    TableBody,
    Tabs,
    Tab,
    RaisedButton,
} from "material-ui";
import XLSX from "xlsx";

export default class ValidationResult extends Component {
    exportUnmapped = e => {
        e.preventDefault();
        const { unmappedOUs } = this.props;
        var data = [["region", "zone", "woreda"]];
        unmappedOUs.forEach(element => {
            const rowArr = element.split("/");
            let row = [rowArr[0], rowArr[1], rowArr[2]];
            data.push(row);
        });
        var filename = "Unmapped OUs Data.xlsx";
        var ws_name = "Data";

        var wb = XLSX.utils.book_new(),
            ws = XLSX.utils.aoa_to_sheet(data);

        XLSX.utils.book_append_sheet(wb, ws, ws_name);

        XLSX.writeFile(wb, filename);
    };

    render() {
        const { unmappedOUs } = this.props;
        return (
            <Tabs>
                <Tab label="Overview">
                    <h4>Validation Summary</h4>
                </Tab>
                <Tab label="Unmapped OUs">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHeaderColumn>
                                    <RaisedButton
                                        primary
                                        label="Export to XLSX"
                                        onClick={this.exportUnmapped}
                                    />
                                </TableHeaderColumn>
                                <TableHeaderColumn>{i18n.t("Region")}</TableHeaderColumn>
                                <TableHeaderColumn>{i18n.t("Zone")}</TableHeaderColumn>
                                <TableHeaderColumn>{i18n.t("Woreda")}</TableHeaderColumn>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {unmappedOUs.map((m, index) => {
                                const row = m.split("/");
                                const no = index + 1;
                                return (
                                    <TableRow key={no}>
                                        <TableRowColumn>{no}</TableRowColumn>
                                        <TableRowColumn>{row[0]}</TableRowColumn>
                                        <TableRowColumn>{row[1]}</TableRowColumn>
                                        <TableRowColumn>{row[2]}</TableRowColumn>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </Tab>
            </Tabs>
        );
    }
}
