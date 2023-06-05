const path = require("path");
const fs = require("fs");
const core = require("@actions/core");
const { SSMClient, GetParametersByPathCommand } = require("@aws-sdk/client-ssm");

// // Uncomment me to use local credentials:
// const credentials = new AWS.SharedIniFileCredentials();
// AWS.config.credentials = credentials;

const getValuesTemplate = async (ValuesFilePath, DeploymentName) => {
  console.log({ ValuesFilePath, DeploymentName });
  try {
    let buff = fs.readFileSync(ValuesFilePath);
    return { template: buff.toString(), fileFound: true };
  } catch (err) {
    return {
      template: `fullnameOverride: ${DeploymentName}\nservice:\n  port: 80\n  name: ${DeploymentName}\n  targetPort: 80\n`,
      fileFound: false,
    };
  }
};

const main = async () => {
  try {
    const ssm = new SSMClient();
    if (!ssm.config.credentials) {
      throw new Error(
        "No credentials. Try adding @aws-actions/configure-aws-credentials earlier in your job to set up AWS credentials.",
      );
    }
    const prefix = core.getInput("prefix");
    const Path = core.getInput("path", { required: true });
    const DeploymentName = core.getInput("deploymentName", { required: true });
    const ValuesFilePath = core.getInput("valuesFilePath");
    const WithDecryption = core.getInput("decrypt") === "true";
    const Recursive = core.getInput("recursive") === "true";

    const Parameters = [];

    let NextToken;
    do {
      let command = new GetParametersByPathCommand({ Path, WithDecryption, Recursive, NextToken });
      const result = await ssm.send(command);
      NextToken = result.NextToken;
      Parameters.push(...result.Parameters);
    } while (NextToken);

    let { template, fileFound } = await getValuesTemplate(ValuesFilePath, DeploymentName);
    console.log({ template, fileFound });
    if (!fileFound) template = template + `env: \n`;

    Parameters.forEach(({ Name, Value, Type }) => {
      const variable = prefix + path.basename(Name);
      if (fileFound) {
        template = template.replaceAll(`$${variable}`, Value);
      } else {
        template = template + `    ${variable}: ${Value}\n`;
      }
    });
    fs.writeFileSync("values.yaml", template);
  } catch (error) {
    core.setFailed(error.message);
  }
};

export default main;
