# es-util-app
Utility functions that serve as wrapper over normally written functions that are to be used across multiple apps.

## Installation
You can install the utility using `npm`, or you can simply download the zip (Click on 'Download zip' button above) and reference the index.js file in your NodeJS code. Please note that this code is not to be used in Front End as not only it is irrelevant, but may fail as well.

Using `npm`, run below command:

`npm i --save https://github.com/eternalsayed/es-util-app`

## Helper functions
### setCommonGlobals(baseDir, projectName)
The function is used once in the start of the cycle to setup globals that are used throughout the project. A few project specific globals are setup through next function specified below.
The parameter baseDir is the path to the project's home directory, where index.js or app.js is present and the parameter projectName is the key identifying which project the utility is being used for. The key is required for project specific globals.

### setProjectSpecificGlobals(projectName)
This function sets project specific globals wherein the project is identified by the key projectName. There might be additions to this function based on future requirements of specific projects.

### setRequestGlobals(req, res, next)
This is a middleware function that is required to set the paths based on request URL. Optional, if you do not want these parameters. But if you want these parameters, call this function as middleware, as below:

```javascript
const appUtil = require('es-util-app');
app.use(appUtil.setRequestGlobals);
```
### loadHelper(name)
This funciton is used by this utility as well as the apps to load one of es-pefixed helpers or a helper whose path is specified in the global object `helpers`. If a helper is specified within global object helpers, it's path must be relative to `helpers` directory within the `home` directory. In all other cases, the function will fail.

In case one of es-prefixed helpers are being loaded, you can pass the complete helper name, such as `es-helper-mysql` or can ignore the es-prefix and just pass the main name, i.e., `mysql`. The helper will load, regardless, in both the cases, given that the helper module/file is not missing.

### toCamelCase(obj)
This function converts an array or object to an object containing camelCased keys only. If a string is passed instead of an array/object, the string will be converted to a camelCased string.

### reverseCamelCase(obj)
This function converts key of camelCased object to an object with regular keys. Please note that camelCased keys will be converted to keys separated by an underscore (`_`).

## createUserToken(userObj)
This function creates a `JWT` using a JS object. It requires the `jsonwebtoken` package to create this token and contains minimal fields from userObj. The size of the token will vary greatly by higher number of fields from userObj and therefore, only minimal fields are taken.


## Contributing:
You're more than welcome to help me improvise this code. To begin, fork the project, create a branch in your name from `master` and when you're done, please raise a `pull-request`. I'll try to be prompt in merging your requests ASAP.
