var messageController = require(process.cwd() + '/controllers/message.js');
var userController = require(process.cwd() + '/controllers/user.js');
var pushyController = require(process.cwd() + '/controllers/pushy.js');
var authController = require(process.cwd() + '/controllers/auth.js');

exports.init = function(router) {
    router.route('/api/users/authenticate')
        .post(authController.getAuthenticationToken);
    router.route('/api/messages/send')
        .post(authController.isTokenAuthenticated, messageController.sendMessage);
    router.route('/api/users/update/pushyId')
        .post(authController.isTokenAuthenticated, userController.addOrUpdatePushyId);
    router.route('/api/users/add/direct')
        .post(userController.addDirectUser);
    router.route('/api/users/fbSignIn')
        .post(userController.getOrAddFacebookUser);
    router.route('/api/users/gPlusSignIn')
        .post(userController.getOrAddGPlusUser);
    router.route('/api/users/user')
        .get(authController.isTokenAuthenticated, userController.getUser);
    router.route('/api/users/search')
        .get(userController.findUsers);
};
