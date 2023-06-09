# Generate values.yaml file from aws ssm parameters

This GitHub action that retrieves microservice specific parameters from your AWS SSM Parameter Store and adds to values.yaml. file and exports values.yaml

## Inputs

### `path`

**Required**. The path name or hierarchy under which to retrieve information about one or more parameters.

> Be advised that any forward slashes [`/`] in your parameter names will be converted to underscores [`_`] (leading slash excluded), and any lowercased characters will be converted to uppercase.

### `deploymentName`

**Required**. Name of the deployment that will use generated `values.yaml`.

### `valuesFilePath`

`values.yaml` template file path. Defaults to `values.yaml`.

### `decrypt`

A Boolean value indicating whether to decrypt any `SecureString` parameter values. The default value is `false`.

### `recursive`

A Boolean value indicating whether to include all parameters within a hierarchy; for example, `/a` and `/a/b`. The default value is `true`.

### `prefix`

An optional prefix to add to the variable name. For example, using `prefix: REACT_APP_` with a parameter named `/myapp/var` will export a variable named `$REACT_APP_MYAPP_VAR`.

## Usage

You can use it as follows:

```yaml
- name: Get AWS SSM Parameter Store values into values.yaml
    uses: getmiso/actions-create-values-from-ssm@v2
    with:
      path: path-to-aws-ssm
      deploymentName: deployment-name
```

### Notes:

This action generates `values.yaml` file with given parameters.
The actions can function in two ways.

#### 1. With values template

Values template can be a file that is given with `valuesFilePath`. Values template can have custom variables that are replaced in this action. If any parameter is not found in the template then it is added as `env` variables to generated values.yaml. Variables that you want to replace with values from AWS Parameter Store can be given with `$PARAMETER_NAME`, like following:

```yaml
fullnameOverride: $AWS_SSM_PARAMETER_NAME
service:
  port: $AWS_SSM_PARAMETER_NAME
  name: $AWS_SSM_PARAMETER_NAME
  targetPort: $AWS_SSM_PARAMETER_NAME
```

This can be better explained with example. Let's say, `valuesFilePath` is `values.yaml` and the file has the following content:

```yaml
fullnameOverride: $DEPLOYMENT_NAME
 service:
   name: $SERVICE_NAME
   port: $SERVICE_PORT
   targetPort: $SERVICE_TARGET_PORT
env:
    ENV_ONE: $ENV_ONE
```

And `path` `config/microservice-name/stage` has following parameters in AWS Parameter Store:

```bash
config/microservice-name/stage/DEPLOYMENT_NAME = microservice
config/microservice-name/stage/SERVICE_NAME = microservice
config/microservice-name/stage/SERVICE_PORT = 8080
config/microservice-name/stage/SERVICE_TARGET_PORT = 8070
config/microservice-name/stage/ENV_ONE = env one txt
config/microservice-name/stage/ENV_TWO = env two txt
config/microservice-name/stage/ENV_THREE = env three txt
```

Then this actions will generate `values.yaml` with following content:

```yaml
fullnameOverride: microservice
service:
  name: microservice
  port: 8080
  targetPort: 8070
env:
  ENV_ONE: env one txt
  ENV_TWO: env two txt
  ENV_THREE: env three txt
```

It is worth noting that, in the above example, `ENV_TWO` and `ENV_THREE` are automatically added to final values.yaml even though they did not exist in template. It is because as we mentioned above, any parameter that is not found in the template will be added as env variables to the final values.yaml. Template can have as much variables as you want as long as the values exist in AWS Parameter Store.

#### 2. Without values template.

If you do not provide values template file or file provided with `valuesFilePath` is not found then the default template is used, and all the AWS Parameter Store parameters provided with `path` will be added as `env` variables.

Here is the default template:

```yaml
fullnameOverride: ${deploymentName}
service:
  name: ${deploymentName}
  port: 80
  targetPort: 80
```

Let's look at an example. If `deploymentName` is provided as `microservice-2` and `path` `config/microservice-name/stage` has following parameters in AWS Parameter Store:

```bash
config/microservice-name/stage/ENV_ONE = env one txt
config/microservice-name/stage/ENV_TWO = env two txt
config/microservice-name/stage/ENV_THREE = env three txt
config/microservice-name/stage/ENV_FOUR = env four txt
```

Then this actions will generate `values.yaml` with following content:

```yaml
fullnameOverride: microservice-2
service:
  name: microservice-2
  port: 80
  targetPort: 80
env:
  ENV_ONE: env one txt
  ENV_TWO: env two txt
  ENV_THREE: env three txt
  ENV_FOUR: env four txt
```
