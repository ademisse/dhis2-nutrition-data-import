export const dataSetTypes = {
    labels: ["CMAM", "Deworming", "GMP", "Child Screening", "PLW Screening", "Vitamin A"],
    categories: ["CMAM", "VA_DEW_DOSES", "GMP_AGES", "SAM_AGES", "MUAC", "VITA_AGES"],
    dataElements: [
        "DATA_ELEMENT_CMAM",
        "DATA_ELEMENT_DEWORMING",
        "DATA_ELEMENT_GMP",
        "DATA_ELEMENT_SCREENING",
        "DATA_ELEMENT_SCREENING_PLW",
        "DATA_ELEMENT_VITAMINA",
    ],
    maxTemplateColSize: [10, 6, 8, 8, 7, 6],
};
export const IMPORT_STRATEGY_TYPES = ["CREATE", "UPDATE", "CREATE_AND_UPDATE", "DELETE"];
export const progressStyle = {
    position: "relative",
    left: 0,
    right: 0,
    zIndex: 1,
};
export const MAPPING_KEY = "NutritionOUMap";
export const API_VERSION = 27;
export const style = {
    templateBtn: { width: "170px" },
    tdStyle: { verticalAlign: "top" },
};
// Amhara	West Gojjam	Dembecha	201202	0	0	18475

export const TEMPLATE_DATA = {
    GMP: [
        [
            "region",
            "zone",
            "woreda",
            "period",
            "GMP Weighed - Total",
            "GMP Moderate Under Weight - Total",
            "GMP Sever Under Weight - Total",
        ],
    ],
    CMAM: [
        [
            "region",
            "zone",
            "woreda",
            "period",
            "Total Cure",
            "Total Died",
            "Discharge Total",
            "Total Defaulter",
            "Total new admission (6-59)",
        ],
    ],
    "Vitamin A": [
        ["region", "zone", "woreda", "period", "Total No Of Children Supplemented Vitamin A"],
    ],
    Deworming: [["region", "zone", "woreda", "period", "Total No of Children Dewormed"]],
    "Child Screening": [
        [
            "region",
            "zone",
            "woreda",
            "period",
            "NoOfChildrenScreened",
            "NoOfChildrenMUAbetween11And119",
            "NoOfChildrenMUAbelow11cm + NoOfChildrenWithBilateralOedema",
        ],
    ],
    "PLW Screening": [
        [
            "region",
            "zone",
            "woreda",
            "period",
            "NoOfPWLMwithMUACbelow21cm",
            "NoOfPWLMScreened - NoOfPWLMwithMUACbelow21cm",
        ],
    ],
};

//============================== CATEGORIES WITH OPTIONS ===============================

//                      [0 - 5 months, 6 - 23 months]
const GMP_AGES = ["WUG9MkRdPcY", "Gvwy6Mipvel"];
//                      [0 - 5 months, 6 - 59 months]
const SAM_AGES = ["qNDHYykQd2K", "E8BWUz9HhGZ"];
//                      [6 - 11 months,12 - 59 months]
const VITA_AGES = ["d22g5YP1NlO", "K3SUmGVYvLN"];
//                          [1st dose,2nd dose]
const VA_DEW_DOSES = ["h2dcJM5ViZH", "QElzw5ycG9o"];
//                  [MUAC < 23 cm,MUAC >= 23 cm]
const MUAC = ["bu8YyqEzK8U", "itmTQsuKOTq"];
//  [default/None]
const CMAM = ["HllvX50cXC0"];
export const CATEGORIES = { CMAM, GMP_AGES, SAM_AGES, VITA_AGES, VA_DEW_DOSES, MUAC };

//==================================== DATA ELEMENTS ====================================

// Children < 2 years weighted during GMP session
// Number of weights recorded with moderate malnutrit
// Number of weights severely underweight
const DATA_ELEMENT_GMP = ["RyqiYTTblPQ", "j2TIsgss4eb", "heTE0neDX34"];
// Total number of children <5yrs screened for acute malnutrition
// Number of children <5 year screened and have moderate acute malnutrition
// Number of children <5 year screened and have severe acute malnutrition
const DATA_ELEMENT_SCREENING = ["JaCTkUMwpmL", "IgRGLLw4Dm0", "EENP2aMcfRS"];
// Number of children  recovered
// Number of children died
// Number of children  transferred
// Number of children defaulted
// Number of children with SAM admitted to TFP(OTP &SC) during the reporting period
const DATA_ELEMENT_CMAM = [
    "KgSKXxGmqpL",
    "R6UvTZuF1oH",
    "WBN0qnQ921s",
    "IftX7cvwGTr",
    "N61WBlB820Z",
];
//Total number of children aged 6-59 months who received Vitamin A supplementation - by age
const DATA_ELEMENT_VITAMINA = ["mlwi0edSHm9"];
//Total number of children aged 24 - 59 months dewormed
const DATA_ELEMENT_DEWORMING = ["TBaMhmwRxhB"];
//Total number of PLW screened for acute malnutrition
const DATA_ELEMENT_SCREENING_PLW = ["JHN5ZWXISGs"];

export const DATA_ELEMENTS = {
    DATA_ELEMENT_GMP,
    DATA_ELEMENT_CMAM,
    DATA_ELEMENT_SCREENING,
    DATA_ELEMENT_VITAMINA,
    DATA_ELEMENT_DEWORMING,
    DATA_ELEMENT_SCREENING_PLW,
};
