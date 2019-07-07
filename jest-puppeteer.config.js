const url = require("url");

const headless = process.env.HEADLESS !== "false";
const dhis2Url = process.env.REACT_APP_DHIS2_URL_TEST || "https://192.168.56.101:8080";
const appUrl = process.env.REACT_APP_URL_TEST || "http://localhost:3000";
const port = parseInt(url.parse(appUrl).port || 80, 10);
const startServer = process.env.START_SERVER !== "false";
const serverCommand = `REACT_APP_DHIS2_BASE_URL=${dhis2Url} REACT_APP_URL_TEST=${appUrl} PORT=${port} yarn start`;

module.exports = {
    launch: {
        dumpio: true,
        headless: headless,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    },
    browserContext: "default",
    server: !startServer
        ? undefined
        : {
              command: serverCommand,
              port: port,
              launchTimeout: 30 * 1000,
          },
    config: { dhis2Url, appUrl },
};
