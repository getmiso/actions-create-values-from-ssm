# Generate values.yaml file from aws ssm parameters

This GitHub action retrieves parameters from your AWS SSM Parameter Store and adds to values.yaml. file and exports values.yaml

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
