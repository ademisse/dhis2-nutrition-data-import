import React from "react";
import PropTypes from "prop-types";
import i18n from "@dhis2/d2-i18n";
import "rc-tree-select/assets/index.css";
import OUMapList from "../oumap/OUMapList";
import SettingsIcon from "@material-ui/icons/Settings";
import SystemUpdateIcon from "@material-ui/icons/SystemUpdate";
import ImportDataTemplate from "../ImportData/ImportDataTemplate";
import FileUpload from "../ImportData/FileUpload/FileUpload";
import Tabs, { Tab } from "material-ui/Tabs";

import Paper from "@material-ui/core/Paper";
import { withFeedback, levels } from "../feedback";

class Root extends React.Component {
    static propTypes = {
        d2: PropTypes.object.isRequired,
        feedback: PropTypes.func.isRequired,
    };

    showFeedback = () => {
        this.props.feedback(levels.INFO, i18n.t("Hello there"));
    };

    render() {
        const { d2 } = this.props;

        return (
            <React.Fragment>
                {/* <p>Current user: {d2.currentUser.displayName}</p> */}

                <Tabs d2={d2}>
                    <Tab label={i18n.t("Data Templates")} icon={<SettingsIcon />}>
                        <Paper style={styles.paper}>
                            <ImportDataTemplate />
                        </Paper>
                    </Tab>
                    <Tab label={i18n.t("Organisation Unit Mapping")} icon={<SettingsIcon />}>
                        <Paper style={styles.paper}>
                            <OUMapList d2={d2} />
                        </Paper>
                    </Tab>
                    <Tab label={i18n.t("Import Data")} icon={<SystemUpdateIcon />}>
                        <Paper style={styles.paper}>
                            <FileUpload d2={d2} />
                        </Paper>
                    </Tab>
                </Tabs>
            </React.Fragment>
        );
    }
}
const styles = {
    paper: {
        padding: "0px",
        paddingTop: "10px",
    },
};
export default withFeedback(Root);
