# Generate values.yaml file from aws ssm parameters

This GitHub action that retrieves microservice specific parameters from your AWS SSM Parameter Store and adds to values.yaml. file and exports values.yaml

## Inputs

### `path`

**Required**. The path name or hierarchy under which to retrieve information about one or more parameters.

> Be advised that any forward slashes [`/`] in your parameter names will be converted to underscores [`_`] (leading slash excluded), and any lowercased characters will be converted to uppercase.

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
    uses: getmiso/actions-create-values-from-ssm@v1
    with:
      path: path-to-aws-ssm
```
### Notes:
This action expects two types of parameters.

1. $path/HELM_DEFAULT_VALUES
   This parameter should store all fields of values.yaml file you want to generate except `env`.
2. Other parameters
   Other parameters are added to newly generated values.yaml as env variables.

Example:
If you provide `path` as `/config/microservice/staging` and you have following parameters in AWS Parameter Store with `/config/microservice/staging` prefix:

- /config/microservice/staging/HELM_DEFAULT_VALUES
```yaml
fullnameOverride: microservice-name
service:
    name: service-name
    targetPort: 80
```
- /config/microservice/staging/VARIABLE_1
```txt
variable-1-text
```
- /config/microservice/staging/VARIABLE_2
```txt
variable-2-text
```
- /config/microservice/staging/VARIABLE_3
```txt
variable-3-text
```
Then this action generates values as follows:
values.yaml:
```yaml
fullnameOverride: microservice-name
service:
    name: service-name
    targetPort: 80
env:
    VARIABLE_1: variable-1-text
    VARIABLE_2: variable-2-text
    VARIABLE_3: variable-3-text
```