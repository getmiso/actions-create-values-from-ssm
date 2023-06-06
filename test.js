const path = require("path");
const fs = require("fs");
const yaml = require("js-yaml");

// // Uncomment me to use local credentials:
// const credentials = new AWS.SharedIniFileCredentials();
// AWS.config.credentials = credentials;

const getValuesTemplate = async (ValuesFilePath, DeploymentName) => {
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
    const prefix = "";
    const DeploymentName = "miso-local";
    const ValuesFilePath = "valuesd.yaml";

    const Parameters = [
      { Name: "/config/miso-local/staging/DEPLOYMENT_NAME", Value: "miso-local" },
      { Name: "/config/miso-local/staging/SERVICE_NAME", Value: "miso-local" },
      { Name: "/config/miso-local/staging/SERVICE_PORT", Value: 8080 },
      { Name: "/config/miso-local/staging/SERVICE_TARGET_PORT", Value: 8080 },
      { Name: "/config/miso-local/staging/ENV_ONE", Value: 'one txt' },
    ];

    let { template, fileFound } = await getValuesTemplate(ValuesFilePath, DeploymentName);
    if (!fileFound && Parameters.length > 0) template = template + `env: \n`;
    let unusedParameters = [];
    Parameters.forEach(({ Name, Value, Type }) => {
      const variable = prefix + path.basename(Name);
      if (fileFound) {
        if (template.includes(`$${variable}`)) {
          template = template.replaceAll(`$${variable}`, Value);
        } else {
          unusedParameters.push({ Name, Value });
        }
      } else {
        template = template + `    ${variable}: ${Value}\n`;
      }
    });
    console.log({ template });
    const templateJSON = yaml.load(template);
    console.log({ templateJSON });
    console.log({ unusedParameters });
    unusedParameters.forEach(({ Name, Value }) => {
      const variable = prefix + path.basename(Name);
      if (templateJSON.env) templateJSON.env[variable] = Value;
      else {
        templateJSON.env = {};
        templateJSON.env[variable] = Value;
      }
    });
    const updatedYamlTemplate = yaml.dump(templateJSON);
    console.log({ templateJSON });
    console.log({updatedYamlTemplate})
    // fs.writeFileSync("values.yaml", updatedYamlTemplate);
  } catch (error) {
    console.log(error);
  }
};

main();
