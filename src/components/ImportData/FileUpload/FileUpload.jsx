import React from "react";
import XLSX from "xlsx";

// Material UI
import { Card, CardText, CardActions } from "material-ui/Card";
import RaisedButton from "material-ui/RaisedButton";
import SelectField from "material-ui/SelectField";
import MenuItem from "material-ui/MenuItem";

import LinearProgress from "material-ui/LinearProgress";
import NutritionImporter from "../NutritionImporter";
import { dataSetTypes, IMPORT_STRATEGY_TYPES } from "../Constants";
import styles from "./styles";
import ImportOptions from "./ImportOptions";
import ImportResult from "../ImportResult/ImportResult";

class FileUpload extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            uploading: false,
            uploadedFile: null,
            importing: false,
            importingState: null,
            importingProgress: 0,

            importLog: null,
            //
            dataSetType: dataSetTypes.labels[0],
            importOptions: {
                preheatCache: true,
                dryRun: true,
                importStrategy: IMPORT_STRATEGY_TYPES[0],
                skipExistingCheck: false,
            },
            parsedResult: {
                allMappedInputData: null,
                correctData: null,
                dataWithError: null,
                unmappedOrgUnits: null,
            },
        };
        this.workbook = null;
        this.NutritionImporter = null;
    }

    toggleDryRun = e => {
        const { importOptions } = this.state;
        importOptions.dryRun = e.target.checked;
        this.setState({ importOptions });
    };

    clickUpload = e => {
        if (this.fileInput && !this.state.uploading) {
            this.fileInput.click(e);
            this.setState({ uploading: true });
        }
    };
    upload = e => {
        var self = this;
        var files = e.target.files,
            file = files[0];
        var reader = new FileReader();
        var rABS = !!reader.readAsBinaryString;
        reader.onload = function(e) {
            var data = e.target.result;
            if (!rABS) data = new Uint8Array(data);
            self.workbook = XLSX.read(data, { type: rABS ? "binary" : "array" });
            self.setState({ uploading: false, uploadedFile: file });
            console.log(self.workbook);
        };
        if (rABS) {
            reader.readAsBinaryString(file);
        } else {
            reader.readAsArrayBuffer(file);
        }
    };

    cancel = e => {
        // if (this.props.cancel) this.props.cancel();
        this.setState({
            uploading: false,
            uploadedFile: null,
            importing: false,
            importingState: null,
            importingProgress: 0,
            importOptions: {
                preheatCache: true,
                dryRun: true,
                importStrategy: IMPORT_STRATEGY_TYPES[0],
                skipExistingCheck: false,
            },
            importLog: null,
        });
    };
    // validate = fn => {
    //     setTimeout(() => {
    //         fn("validating", 25, importL);
    //         // this.setState({ importingState: "validating", importLog: importL });
    //     }, 2000);
    //     setTimeout(() => {
    //         fn("mapping", 50, importL);
    //     }, 2000);
    //     setTimeout(() => {
    //         fn("complete", 100, importL);
    //     }, 2000);
    // };
    process = e => {
        this.setState({ importing: true, importingState: "start" });
        this.NutritionImporter = new NutritionImporter(
            this.state.dataSetType,
            this.state.uploadedFile.name,
            this.workbook,
            this.state.importOptions,
            this.importProgess,
            this.props.d2,
            this.state.parsedResult
        );
        this.NutritionImporter.import();

        // setTimeout(() => {
        //     this.setState({ importingState: "complete", importLog: importL });
        // }, 5000);
        // this.validate(this.importProgess);
    };

    importProgess = (state, progress, importLog, parsedResult) => {
        this.setState({
            importingState: state,
            importingProgress: progress,
            importLog: importLog,
            parsedResult: parsedResult,
        });
    };

    renderUpload() {
        return <RaisedButton primary label="Select Workbook File" onClick={this.clickUpload} />;
    }

    renderUploading() {
        const progressStyle = {
            position: "relative",
            left: 0,
            right: 0,
            zIndex: 1,
        };

        return (
            <div>
                <div style={progressStyle}>
                    <LinearProgress
                        style={{ height: 25 }}
                        mode={this.state.uploadProgress ? "determinate" : "indeterminate"}
                        value={this.state.uploadProgress}
                    />
                </div>
            </div>
        );
    }

    renderUploaded() {
        return (
            <div>
                <strong>Workbook File:</strong>
                &nbsp;
                {this.state.uploadedFile.name}
            </div>
        );
    }
    getDataSetListItems = () =>
        dataSetTypes.labels.map(ds => (
            <MenuItem key={ds + ""} value={ds + ""} primaryText={ds + ""} />
        ));
    handleDataSetTypeChange = (evt, key, payload) => {
        this.setState({ dataSetType: payload });
    };
    handleImportOptionsChange = options => {
        this.setState({ importOptions: options });
        if (this.NutritionImporter) {
            this.NutritionImporter.setImportOptionValues(options);
        }
    };
    renderDefault() {
        const setRef = ref => {
            this.fileInput = ref;
        };
        return (
            <div>
                <ImportOptions
                    options={this.state.importOptions}
                    onChange={options => this.handleImportOptionsChange(options)}
                />
                <br />
                <SelectField
                    floatingLabelText="Select Dataset Type..."
                    value={"" + this.state.dataSetType}
                    onChange={this.handleDataSetTypeChange}
                >
                    {this.getDataSetListItems()}
                </SelectField>
                <br />
                <br />

                {this.state.uploadedFile
                    ? this.renderUploaded()
                    : this.state.uploading
                    ? this.renderUploading()
                    : this.renderUpload()}
                <input
                    type="file"
                    style={{ visibility: "hidden", display: "none" }}
                    ref={setRef}
                    onChange={this.upload}
                />
            </div>
        );
    }

    renderButtons() {
        if (this.state.importing && this.state.importingState === "complete") {
            return (
                <RaisedButton size="small" variant="contained" primary onClick={this.cancel}>
                    OK
                </RaisedButton>
            );
        } else {
            return (
                <div>
                    <RaisedButton
                        size="small"
                        variant="contained"
                        primary
                        disabled={!this.state.uploadedFile || this.state.importing}
                        onClick={this.process}
                    >
                        {this.state.importing ? "Importing..." : "Import"}
                    </RaisedButton>

                    <RaisedButton size="small" variant="contained" secondary onClick={this.cancel}>
                        Cancel
                    </RaisedButton>
                </div>
            );
        }
    }

    render() {
        const {
            importLog,
            uploadedFile,
            dataSetType,
            importingProgress,
            importingState,
            parsedResult,
        } = this.state;
        return (
            <Card style={styles.card}>
                <CardText>
                    <h2>Import Nutrition Excel (xlsx) Data to DHIS2</h2>
                    {this.state.importing ? (
                        <ImportResult
                            importLog={importLog}
                            uploadedFile={uploadedFile}
                            dataSetType={dataSetType}
                            importingProgress={importingProgress}
                            importingState={importingState}
                            parsedResult={parsedResult}
                        />
                    ) : (
                        this.renderDefault()
                    )}
                </CardText>
                <CardActions>{this.renderButtons()}</CardActions>
            </Card>
        );
    }
}

export default FileUpload;
