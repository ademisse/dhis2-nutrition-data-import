import React, { Component } from "react";
import LinearProgress from "material-ui/LinearProgress";
import { Card, CardText } from "material-ui/Card";
import RaisedButton from "material-ui/RaisedButton";
import XLSX from "xlsx";
import spinner from "./spinner.gif";

const styles = {
    progressStyle: {
        position: "relative",
        left: 0,
        right: 0,
        zIndex: 1,
    },
    spinner: { width: 32, height: 32, verticalAlign: "middle", margin: 5 },
    cardText: { whiteSpace: "pre", overflowX: "scroll" },
    statusBadge: { color: "white", padding: 4, borderRadius: 4 },
    textColor: {
        WARNING: { backgroundColor: "#ff9800", color: "white", padding: 4, borderRadius: 4 },
        ERROR: { backgroundColor: "#ae1807", color: "white", padding: 4, borderRadius: 4 },
        SUCCESS: { backgroundColor: "#07ae1a", color: "white", padding: 4, borderRadius: 4 },
    },
};

export class ImportResult extends Component {
    renderImportComplete() {
        const {
            importLog: { importSummary },
            uploadedFile,
            dataSetType,
        } = this.props;
        let conflicts = "";
        let content = "";
        let textStyle = styles.textColor[importSummary.status];
        if (importSummary.conflicts && importSummary.conflicts.length > 0) {
            conflicts = (
                <div>
                    <h4>Import Conflicts</h4>
                    <ul>
                        {importSummary.conflicts.map((conflict, index) => {
                            return (
                                <li key={index}>
                                    <strong>{conflict.object}</strong>: {conflict.value}
                                </li>
                            );
                        })}
                    </ul>
                </div>
            );
        }
        content = (
            <div>
                <h4>Import Summary</h4>
                <ul>
                    <li>
                        <strong>Dataset Type</strong>: {dataSetType}
                    </li>
                    <li>
                        <strong>Workbook</strong>: {uploadedFile.name}
                    </li>
                </ul>
                {this.renderValidationResult()}
                <p>
                    <strong>Import Result Status:</strong>{" "}
                    <span style={textStyle}>{importSummary.status}</span>
                </p>
                <p>
                    <strong>Import Count</strong>
                </p>
                <ul>
                    <li>
                        <strong>Deleted</strong>: {importSummary.importCount.deleted}
                    </li>
                    <li>
                        <strong>Ignored</strong>: {importSummary.importCount.ignored}
                    </li>
                    <li>
                        <strong>Imported</strong>: {importSummary.importCount.imported}
                    </li>
                    <li>
                        <strong>Updated</strong>: {importSummary.importCount.updated}
                    </li>
                </ul>
                {conflicts}
                <Card>
                    <CardText style={styles.cardText}>{importSummary.description}</CardText>
                </Card>
            </div>
        );

        return <div>{content}</div>;
    }
    renderImportInProgress() {
        const { importingProgress, uploadedFile, dataSetType } = this.props;
        let content = "";
        content = (
            <div>
                <span>
                    <img src={spinner} alt="spinner" style={styles.spinner} />
                    <h4>Importing Progress...</h4>
                </span>
                <ul>
                    <li>
                        <strong>Data Set</strong>: {dataSetType}
                    </li>
                    <li>
                        <strong>Workbook</strong>: {uploadedFile.name}
                    </li>
                </ul>
                {this.renderValidationResult()}

                <div style={styles.progressStyle}>
                    <LinearProgress
                        style={{ height: 25 }}
                        mode={importingProgress ? "determinate" : "indeterminate"}
                        value={importingProgress}
                    />
                </div>
            </div>
        );
        return <div>{content}</div>;
    }
    renderValidationResult() {
        const { parsedResult } = this.props;
        let content = "";
        content = (
            <div>
                <h4>Organisation Units Validation Summary</h4>
                <ul>
                    <li>
                        <strong>Data Elements with Correctly Mapped OUs</strong>:{" "}
                        {parsedResult.correctData
                            ? parsedResult.correctData.dataValues.length
                            : "N/A"}
                    </li>
                    <li>
                        <strong>Data Elements with OU Mapping Not found and Ignored</strong>:{" "}
                        {parsedResult.dataWithError
                            ? parsedResult.dataWithError.dataValues.length
                            : "N/A"}
                    </li>
                    <li>
                        <strong>Organisation Units Mapping Not Found</strong>:{" "}
                        {parsedResult.unmappedOrgUnits
                            ? parsedResult.unmappedOrgUnits.length
                            : "N/A"}
                    </li>
                </ul>
                <RaisedButton
                    size="medium"
                    variant="contained"
                    primary
                    onClick={this.handleDownloadUnmappedOUs}
                    disabled={!parsedResult.unmappedOrgUnits}
                    style={{
                        width: "25%",
                        color: "white",
                    }}
                >
                    Click Here to Download Unmapped OU List (xlsx)
                </RaisedButton>
                <br />
                <br />
            </div>
        );
        return <div>{content}</div>;
    }

    handleDownloadUnmappedOUs = e => {
        e.preventDefault();
        const { parsedResult } = this.props;
        var data = [["region", "zone", "woreda"]];
        parsedResult.unmappedOrgUnits.forEach(element => {
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
        console.log(parsedResult);
    };
    render() {
        const { importingState } = this.props;

        return (
            <React.Fragment>
                {importingState === "complete"
                    ? this.renderImportComplete()
                    : this.renderImportInProgress()}
            </React.Fragment>
        );
    }
}

export default ImportResult;
