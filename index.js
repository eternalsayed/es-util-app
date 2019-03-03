/**
 * Created by sayed on 7/3/18.
 */
const debug = require('debug')(process.env.DEBUG);
module.exports = {
    setCommonGlobals: function(baseDir) {
        if(this.globals) return console.log('Globals already set. Returning');
        baseDir = baseDir || __dirname;
        this.baseDir = baseDir;
        this.globals = true;
        debug('setting common globals!');
        global.__home = baseDir+'/';
        global.__modules = baseDir+"/modules";
        global.__routes = baseDir+"/modules/api/routes/";
        global.__apiModels = baseDir+'/api/models/';
        global.__jsonPath = baseDir+'/data/';
        global.__helpers = baseDir+'/helpers/';
        global.__data = baseDir+'/data/';
        global.__config = baseDir+'/configs/';
        global.__lang = __config+'/lang';
        global.__middleware = baseDir+'/middleware/';
        global.__public = baseDir+'/public/';
        global.__images = baseDir+'/public/images/';

        global.dbo = this.helper('db/mysql');

        const paths = require('path');
        const basename = paths.basename(__home);

        //https://stackoverflow.com/questions/8683895/how-do-i-determine-the-current-operating-system-with-node-js
        const platform = process.platform;// 'darwin', 'freebsd', 'linux', 'sunos' or 'win32'
        global.__isMac = Boolean(platform.match(/darwin/i));
        debug('isMac ?', __isMac && 'Yes' || 'No');
        global.__isLocal = (__isMac || platform.match(/win32/i)) && false;
        debug('isLocal ?', __isLocal && 'Yes' || 'No');
        global.__mode = !(__isMac || __isLocal) ?(basename.match(/live/i) ?'live' :'dev') :"local";
        //set mode to DEV for debug mode
        if(process.env.DEBUG) {
            global.__mode = 'dev';//TODO: Remove this before deploying
        }
        debug('__mode: ', __mode);
        global.__api = __mode==='live' ?'/prod' :(__isMac || __isLocal ?'' :'/dev');
        debug('__api: ', __api);
    },
    setRequestGlobals: function(req, res, next) {
        const protocol = 'http' +((req.connection && req.connection.encrypted && 's') || '')+'://';
        global.__server = protocol+req.headers.host;//contains path ONLY upto server AND DOES NOT POINT to specific API environment
        global.__apiPath = __server+__api;//contains for API referred by this request
        next();
    },
    helper: function (name) {
        const baseUrl = __helpers;
        if(typeof helpers!=='undefined' && helpers.list[name])
            return require(baseUrl+helpers.list[name]);
        return require(baseUrl+name);
    },

    // removed: .loadModules function

    parentUrl: function(url) {
        return url.substr(0, url.lastIndexOf('/'));
    },
    getJSON: function(jsonPath, def=null) {
        let fs = require('fs');
        jsonPath = jsonPath.replace(/\.json$/i,'')+'.json';
        let json;
        try {
            if(fs.existsSync(jsonPath)) {
                json = fs.readFileSync(jsonPath);
                json = JSON.parse(json);
            }
            return json || def;
        }catch(e) {
            console.log('parse error: ', e);
        }
        return json || def;
    },
    saveJSON: function(filePath, content) {
        filePath = filePath.replace(/\.json$/i,'')+'.json';
        let fs = require('fs');
        content = typeof content==='string' ?content :JSON.stringify(content, null, 4);
        fs.writeFileSync(filePath, content);
    },
    toCamelCase: function (obj) {
        var self = this;
        if(typeof obj=='string') {
            return obj.replace(/_[a-z]/g, function (match) {
                return match.substr(1,1).toUpperCase()+match.substr(2);
            })
        }
        else {
            var temp = typeof obj=='object' ?{} :[];
            for(var key in obj) {
                var val = obj[key];
                var newKey = self.toCamelCase(key);
                temp[newKey] = val;
            }
            return temp;
        }
    },
    reverseCamelCase: function (obj) {
        var self = this;
        if(typeof obj=='string') {
            return obj.replace(/[A-Z]/g, function (match) {
                return '_'+match.toLowerCase();
            })
        }
        else {
            var temp = typeof obj==='object' ?{} :[];
            for(var key in obj) {
                var val = obj[key];
                var newKey = self.reverseCamelCase(key);
                temp[newKey] = val;
            }
            return temp;
        }
    },

    base64: function (str) {
        str = typeof str==='string' ?str :JSON.stringify(str);
        return (new Buffer(str).toString('base64'));
    },
    decodeBase64: function (b64Encoded) {
        return (new Buffer(b64Encoded, 'base64').toString());
    },
    createUserToken: function (userObj) {
        let jwt = require('jsonwebtoken');
        const temp = this.toCamelCase(userObj);
        const config = require(__config+'/app/app.config');
        var tokenObj = {
            userId: temp.userId,
            userEmail: temp.userEmail || temp.email,
            name: temp.fullName || temp.name
        };
        return jwt.sign(tokenObj, config.jwtSecret, {noTimestamp: true});
    }
};