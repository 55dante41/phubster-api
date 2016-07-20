var request = require('request');

var authConfig = require(process.cwd() + '/config/auth.js');
var arrayUtil = require(process.cwd() + '/util/array.js');

exports.sendMessage = function(targets, data, successCb, errorCb) {
    var registrationIds = [];
    if (arrayUtil.isArray(targets)) {
        registrationIds = targets;
    } else {
        registrationIds.push(targets);
    }
    request.post({
        'url': 'https://pushy.me/push?api_key=' + authConfig.pushyAPIToken,
        'json': true,
        'body': {
            'registration_ids': registrationIds,
            'data': data
        }
    }, function(err, httpResponse, body) {
        console.log('================');
        console.log(err);
        console.log(JSON.stringify(httpResponse));
        console.log(body);
        console.log(registrationIds);
        console.log('================');
        if (err) {
            errorCb(err);
        } else {
            successCb(httpResponse, body);
        }
    });
};
