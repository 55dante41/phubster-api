exports.init = function(rootDirectory) {
    //customized "require" method from ROOT dir
    global.rootRequire = function(pathFromRoot) {
        return require(rootDirectory + pathFromRoot);
    };

    //customized "require" method for configs
    global.requireConfig = function(configurationName) {
        return rootRequire('/config/' + configurationName);
    };

    //customized "require" method for models
    global.requireModel = function(modelName) {
        return rootRequire('/models/' + modelName);
    };

    //customized "require" method for controllers
    global.requireController = function(controllerName) {
        return rootRequire('/controllers/' + controllerName);
    };

    //customized "require" method for helpers
    global.requireHelper = function(helperName) {
        return rootRequire('/helpers/' + helperName);
    };

    //customized "require" method for utils
    global.requireUtil = function(utilName) {
        return rootRequire('/util/' + utilName);
    };

    //customized "require" method for errors
    global.requireError = function(errorName) {
        return rootRequire('/errors/' + errorName);
    }

    //logs the error and sends an appropriate http response
    global.handleErrorResponse = function(error, response) {
        console.log(error);
        response
            .status(error.statusCode || 500)
            .send({
                message: error.statusMessage || 'Server error. Please validate and try again.',
                error: error.toString()
            });
    };
};
