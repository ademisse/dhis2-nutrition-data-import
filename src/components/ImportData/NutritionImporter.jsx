import XLSX from "xlsx";

// import OrgUnitTreeMapper from "../util/orgUnitTreeMapper";

// import AppConfig from "../appConfig";
import { API_VERSION, MAPPING_KEY, dataSetTypes, CATEGORIES, DATA_ELEMENTS } from "./Constants";

class NutritionImporter {
    constructor(dataSetType, filename, workbook, options, callback, d2, parsedResult) {
        // if (!dataSet || !(typeof dataSet === "number")) {
        //     throw "dataSet must be a number";
        // }
        if (!workbook) {
            const e = { error: "workbook is required" };
            throw e;
        }
        this.dataSetType = dataSetType;
        this.workbook = workbook;
        this.filename = filename;
        this.options = options;
        this.orgUnits = null;
        this.orgTree = null;
        this.rootOrgId = null;
        this.attributeCodes = {};
        this.callback = callback;
        //
        this.d2 = d2;
        this.organisationUnits = null;
        this.mappings = null;
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        this.allInputData = JSON.stringify(XLSX.utils.sheet_to_json(worksheet))
            .toString()
            .split("},");
        this.allParsedData = null;

        this.parsedResult = parsedResult;
        // parsedResult:{
        //     allMappedInputData: null,
        // correctData: null,
        // dataWithError: null,
        // unmappedOrgUnits: null,
        // }
    }

    // Report state back via the callback method.
    // State: 'parsing', 'importing', 'complete'
    reportState(state, progress, importLog, parsedResult) {
        if (this.callback) {
            this.callback(state, progress, importLog, parsedResult);
        }
    }
    setImportOptionValues(options) {
        this.options = options;
    }
    import() {
        this.reportState("parsing", 25, { log: "performing parse..." }, this.parsedResult);

        // Load data from the API required to process
        Promise.all([
            this.fetchAllOrgUnit(),
            this.fetchAllMaps(MAPPING_KEY, this.createNewMappingSetting),
        ]).then(results => {
            this.organisationUnits = results[0].organisationUnits;
            this.mappings = results[1].mappings;
            // console.log("RESULTS:", results);
            this.reportState("parsing", 50, { log: "performing parse..." }, this.parsedResult);
            this.parseData();
        });
    }
    fetchAllOrgUnit() {
        var self = this;
        return new Promise(function(resolve, reject) {
            const api = self.d2.Api.getApi();
            api.get(
                `${API_VERSION}/organisationUnits?filter=organisationUnitGroups.id:eq:yMy2gtvFpvx&paging=false&fields=id,shortName,name,displayName,displayShortName`
            )
                .then(r => {
                    resolve({ organisationUnits: r.organisationUnits });
                    // console.warn("OU", this.organisationUnits);
                })
                .catch(e => {
                    console.log("OrgUnitTree fetchNode failed");
                    console.log(e);
                    reject({ organisationUnits: null });
                });
        });
    }
    fetchAllMaps(mappingKey = MAPPING_KEY, cb = this.createNewMappingSetting) {
        const self = this;
        return new Promise(function(resolve, reject) {
            const api = self.d2.Api.getApi();
            api.get(`${API_VERSION}/systemSettings`)
                .then(r => {
                    if (r[mappingKey]) {
                        let mappings = JSON.parse(r[mappingKey]);
                        resolve({ mappings: mappings[mappingKey] });
                    } else {
                        console.warn(
                            `NO Key found in the setting... Creating One for ${mappingKey}`
                        );

                        cb(mappingKey);
                        resolve({ mappings: [] });
                    }
                })
                .catch(e => {
                    console.log("OrgUnitMapping fetchNode failed");
                    console.log(e);
                    reject({ mappings: null });
                });
        });
    }
    createNewMappingSetting = async (mappingKey = MAPPING_KEY) => {
        try {
            const api = this.props.d2.Api.getApi();
            const requestOptions = {
                headers: {
                    "Content-Type": "text/plain",
                },
            };
            const payload = [];
            const mappings = payload;
            const dataMap = {};
            dataMap[mappingKey] = mappings;
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

    parseData() {
        switch (this.dataSetType) {
            case dataSetTypes.labels[0]:
                console.log("Validating CMAM data...");
                this.parseDSData(0);
                break;
            case dataSetTypes.labels[1]:
                console.log("Validating Deworming data...");
                this.parseDSData(1);
                break;
            case dataSetTypes.labels[2]:
                console.log("Validating GMP data...");
                this.parseDSData(2);
                break;
            case dataSetTypes.labels[3]:
                console.log("Validating Child Screening data...");
                this.parseDSData(3);
                break;
            case dataSetTypes.labels[4]:
                console.log("Validating PLW Screening data...");
                this.parseDSData(4);
                break;
            case dataSetTypes.labels[5]:
                console.log("Validating Vitamin A data...");
                this.parseDSData(5);
                break;
            default:
                console.error("Cannot perform validation, Dataset Type Not Selected!");
                break;
        }
    }

    parseDSData = async itemIndex => {
        let jsonString = '{"dataValues":[';
        // let validationSummary = {
        //     inputNoOfRows: this.allInputData.length,
        //     noOfValidDataRows: 0,
        //     noOfInvalidDataRows: 0,
        //     validationMessage: "",
        // };
        this.allInputData.forEach(row => {
            //Get individual elements in a row
            let sheetCol = 1;
            let dataElementSectionBRotator = 0;
            let orgUnit = "";
            let oCombo = "";
            let period = "";

            let dataRowSet = row.toString();
            let dataSetRowArray = dataRowSet.toString().split(",");

            let region = "";
            let zone = "";
            let woreda = "";

            dataSetRowArray.forEach(async cellVal => {
                let dataRowValue = cellVal.toString().split(":");
                let cellValue = dataRowValue[1];

                if (cellValue) {
                    if (cellValue.indexOf('"') > -1) {
                        cellValue = cellValue.replace(/["']/g, "").trim();
                    }
                }
                // sheetCol 1 = region, 2 = zone, 3 = woreda
                if (sheetCol === 1) {
                    region = cellValue;
                }
                if (sheetCol === 2) {
                    zone = cellValue;
                }
                if (sheetCol === 3) {
                    woreda = cellValue;
                    try {
                        orgUnit = region + "/" + zone + "/" + woreda;
                    } catch (error) {
                        orgUnit = "";
                    }
                }
                // sheetCol 4 = period
                if (sheetCol === 4) {
                    period = cellValue;
                }

                // sheetCol 5 - max(datataset columns count) = dataElements
                if (sheetCol > 4 && sheetCol < dataSetTypes.maxTemplateColSize[itemIndex]) {
                    // CMAM
                    if (itemIndex === 0) {
                        //DATA_ELEMENTS["DATA_ELEMENT_GMP"][dataElementSectionBRotator] +
                        jsonString =
                            jsonString +
                            '{"dataElement":"' +
                            DATA_ELEMENTS[dataSetTypes.dataElements[itemIndex]][
                                dataElementSectionBRotator
                            ] +
                            '","period":"' +
                            period +
                            '","orgUnit":"' +
                            orgUnit +
                            '","value":"' +
                            cellValue +
                            '"},';
                    }
                    //PLW SCREENING
                    else if (itemIndex === 4) {
                        if (sheetCol % 2 !== 0) {
                            oCombo = CATEGORIES[dataSetTypes.categories[itemIndex]][0]; //  CATEGORIES["GMP_AGES"][0];
                            //DATA_ELEMENTS["DATA_ELEMENT_GMP"][dataElementSectionBRotator] +
                            jsonString =
                                jsonString +
                                '{"dataElement":"' +
                                DATA_ELEMENTS[dataSetTypes.dataElements[itemIndex]][
                                    dataElementSectionBRotator
                                ] +
                                '","period":"' +
                                period +
                                '","orgUnit":"' +
                                orgUnit +
                                '","categoryOptionCombo":"' +
                                oCombo +
                                '","value":"' +
                                cellValue +
                                '"},';
                        } else {
                            oCombo = CATEGORIES[dataSetTypes.categories[itemIndex]][1];
                            jsonString =
                                jsonString +
                                '{"dataElement":"' +
                                DATA_ELEMENTS[dataSetTypes.dataElements[itemIndex]][
                                    dataElementSectionBRotator
                                ] +
                                '","period":"' +
                                period +
                                '","orgUnit":"' +
                                orgUnit +
                                '","categoryOptionCombo":"' +
                                oCombo +
                                '","value":"' +
                                cellValue +
                                '"},';
                            dataElementSectionBRotator = dataElementSectionBRotator + 1;
                        }
                    }
                    // GMP , CHILDREN SCREENING, VITAMIN A, DEWORMING
                    else {
                        oCombo = CATEGORIES[dataSetTypes.categories[itemIndex]][0]; //  CATEGORIES["GMP_AGES"][0];
                        //DATA_ELEMENTS["DATA_ELEMENT_GMP"][dataElementSectionBRotator] +
                        jsonString =
                            jsonString +
                            '{"dataElement":"' +
                            DATA_ELEMENTS[dataSetTypes.dataElements[itemIndex]][
                                dataElementSectionBRotator
                            ] +
                            '","period":"' +
                            period +
                            '","orgUnit":"' +
                            orgUnit +
                            '","categoryOptionCombo":"' +
                            oCombo +
                            '","value":"' +
                            0 +
                            '"},';

                        oCombo = CATEGORIES[dataSetTypes.categories[itemIndex]][1];
                        jsonString =
                            jsonString +
                            '{"dataElement":"' +
                            DATA_ELEMENTS[dataSetTypes.dataElements[itemIndex]][
                                dataElementSectionBRotator
                            ] +
                            '","period":"' +
                            period +
                            '","orgUnit":"' +
                            orgUnit +
                            '","categoryOptionCombo":"' +
                            oCombo +
                            '","value":"' +
                            cellValue +
                            '"},';
                        dataElementSectionBRotator = dataElementSectionBRotator + 1;
                    }
                }
                sheetCol = sheetCol + 1;

                // == Iteration of cellValues Ends
            });
            // == Iteration of Rows in a Sheet Ends
        });
        if (jsonString.indexOf("}]") > -1) {
            jsonString = jsonString.substr(0, jsonString.length - 2).trim();
        }
        const dsData = jsonString.substr(0, jsonString.length - 3) + '"}]}';
        this.allParsedData = dsData; //{ allParsedData: dsData }
        // console.log("dsData:" + dsData);
        this.mapOrgUnitName(dsData);
    };
    mapOrgUnitName = async data => {
        const dataObj = JSON.parse(data);
        let unmappedOrgUnit = [];
        let mappedDSData = {};
        mappedDSData["dataValues"] = dataObj["dataValues"].map(e => {
            const orgUnitName = e.orgUnit.substr(e.orgUnit.lastIndexOf("/") + 1);
            let foundMap = this.organisationUnits.filter(function(item) {
                if (item.name === orgUnitName || item.shortName === orgUnitName) return true;
                else return false;
            });
            if (foundMap.length > 0) {
                e = { ...e, orgUnit: foundMap[0].id };
                return e;
            } else {
                foundMap = this.mappings.filter(function(item) {
                    if (item.alternativeName === orgUnitName) return true;
                    else return false;
                });
                if (foundMap.length > 0) {
                    e = { ...e, orgUnit: foundMap[0].orgUnitId };
                    return e;
                } else {
                    //e = { ...e, orgUnit: '' }
                    unmappedOrgUnit.push(e.orgUnit);
                    return e;
                }
            }
        });
        const unmappedOrgUnits = Array.from(new Set(unmappedOrgUnit));
        const allMappedInputData = mappedDSData;
        let correctData = {};
        correctData.dataValues = mappedDSData["dataValues"].filter(dataVal => {
            const val = dataVal["orgUnit"];
            return val.lastIndexOf("/") === -1;
        });

        let dataWithError = {};
        dataWithError.dataValues = mappedDSData["dataValues"].filter(dataVal => {
            const val = dataVal["orgUnit"];
            return val.lastIndexOf("/") !== -1;
        });
        this.parsedResult.allMappedInputData = allMappedInputData;
        this.parsedResult.correctData = correctData;
        this.parsedResult.dataWithError = dataWithError;
        this.parsedResult.unmappedOrgUnits = unmappedOrgUnits;
        this.reportState("parsing", 60, { log: "parsing complete" }, this.parsedResult);

        if (window.confirm("Are you sure you want to import the data?")) {
            // const { correctData } = this.state;
            // this.setState({ importing: true, importingState: "start" });
            this.importDataValues(this.parsedResult.correctData);
        }
        // this.reportState("complete", 100, importLog)
        // this.setState({
        //     validating: false,
        //     dataValidated: true,
        //     allMappedInputData,
        //     correctData,
        //     dataWithError,
        //     unmappedOrgUnits,
        // });
    };

    importDataValues = async (
        payload,
        ouScheme = "UID",
        importStrategy = this.options.importStrategy,
        dryRun = this.options.dryRun,
        preheatCache = this.options.preheatCache,
        skipExistingCheck = this.options.skipExistingCheck
    ) => {
        try {
            const dataElementIdScheme = "UID";
            const api = this.d2.Api.getApi();
            const requestOptions = {
                headers: {
                    "Content-Type": "application/json",
                },
            };
            await api
                .post(
                    `${API_VERSION}/dataValueSets?dataElementIdScheme=${dataElementIdScheme}&orgUnitIdScheme=${ouScheme}&dryRun=${dryRun}&preheatCache=${preheatCache}&skipExistingCheck=${skipExistingCheck}&importStrategy=${importStrategy}`,
                    payload,
                    requestOptions
                )
                // .then(res => JSON.stringify(res))
                .then(jsonRes =>
                    this.reportState("complete", 100, { importSummary: jsonRes }, this.parsedResult)
                ); //({ importingState: "complete", importLog: jsonRes }));
            // .then(jsonRes => this.setState({ importingState: "complete", importLog: jsonRes }));
        } catch (e) {
            console.log("Posting / Importing data failed");
            console.log(e);
        }
    };
}

export default NutritionImporter;
