const path = require("path");
const fs = require("fs");
const core = require("@actions/core");
const AWS = require("aws-sdk");

// // Uncomment me to use local credentials:
// const credentials = new AWS.SharedIniFileCredentials();
// AWS.config.credentials = credentials;

(async () => {
  try {
    const ssm = new AWS.SSM();
    if (!ssm.config.credentials) {
      throw new Error(
        "No credentials. Try adding @aws-actions/configure-aws-credentials earlier in your job to set up AWS credentials.",
      );
    }
    const prefix = core.getInput("prefix");
    const Path = core.getInput("path", { required: true });
    const WithDecryption = core.getInput("decrypt") === "true";
    const Recursive = core.getInput("recursive") === "true";

    const Parameters = [];

    let NextToken;
    do {
      const result = await ssm.getParametersByPath({ Path, WithDecryption, Recursive, NextToken }).promise();
      NextToken = result.NextToken;
      Parameters.push(...result.Parameters);
    } while (NextToken);
    let defaultValues = "";
    let content = `env: \n`;
    Parameters.forEach(({ Name, Value, Type }) => {
      const variable = prefix + path.basename(Name);
      if (variable === "HELM_DEFAULT_VALUES") {
        defaultValues = Value;
      } else {
        content = content + `    ${variable}: ${Value}\n`;
      }
    });
    content = content + defaultValues;
    fs.writeFileSync("values.yaml", content);
  } catch (error) {
    core.setFailed(error.message);
  }
})();
