import React, { Component } from "react";
import { Card, CardText } from "material-ui/Card";
import { dataSetTypes, TEMPLATE_DATA, style as s } from "./Constants";
import XLSX from "xlsx";
import styles from "./FileUpload/styles";

export default class ImportDataTemplate extends Component {
    downloadExcel = (e, ds) => {
        e.preventDefault();
        var filename = ds + " Import Data Template.xlsx";
        var ws_name = ds + " Data";

        // if (typeof console !== 'undefined') console.log(new Date());
        var wb = XLSX.utils.book_new(),
            ws = XLSX.utils.aoa_to_sheet(TEMPLATE_DATA[ds]);

        /* add worksheet to workbook */
        XLSX.utils.book_append_sheet(wb, ws, ws_name);

        /* write workbook */
        // if (typeof console !== 'undefined') console.log(new Date());
        XLSX.writeFile(wb, filename);
        // if (typeof console !== 'undefined') console.log(new Date());
    };
    getButtons() {
        return dataSetTypes.labels.map(ds => {
            return (
                <p key={ds}>
                    <button key={ds} style={s.templateBtn} onClick={e => this.downloadExcel(e, ds)}>
                        {ds} Template
                    </button>
                </p>
            );
        });
    }
    render() {
        return (
            <Card style={styles.card}>
                <CardText>
                    <h2>Overview</h2>
                    <table>
                        <tbody>
                            <tr>
                                <td>
                                    <h4>Download Templates</h4>
                                    {this.getButtons()}
                                </td>
                                <td style={s.tdStyle}>
                                    <h4>NOTE</h4>
                                    <p>
                                        The following formats should be maintained while preparing
                                        the data in the template...
                                    </p>
                                    <ul>
                                        <li key={1}>
                                            <b>Region: </b> Name of Region, should not be empty!{" "}
                                            <b>eg. Afar</b>
                                        </li>
                                        <li key={2}>
                                            <b>Zone: </b> Zone Name, should not be empty!{" "}
                                            <b>eg. Zone 1</b>
                                        </li>
                                        <li key={3}>
                                            <b>Woreda: </b> Woreda Name, should not be empty!{" "}
                                            <b>eg. Adaar</b>
                                        </li>
                                        <li key={4}>
                                            <b>Period: </b> Reporting Period expressed in the format{" "}
                                            <b>yyyymm</b>, should not be empty!{" "}
                                            <b>eg. 201005 which imply May-2010</b>
                                        </li>
                                        <li key={5}>
                                            <b>dataValues: </b> Corresponding data values, should be{" "}
                                            <b>a positive number value</b>, should not be empty!{" "}
                                        </li>
                                    </ul>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </CardText>
            </Card>
        );
    }
}
