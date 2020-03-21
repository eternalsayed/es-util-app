/**
 * Created by sayed on 7/3/18.
 */
const debug = require('debug')(process.env.DEBUG || 'app');
module.exports = {
    preloads: {mysql: true},
    presets: {
        api: true,
        middleware: true,
        images: true,
        data: true,
        json: true,
        modules: true,
        helpers: true,
        mode: true,
        config: true,
        public: true,
        lang: true
    },
    setCommonGlobals: function(baseDir) {
        if(this.globals) return console.log('Globals already set. Returning');
        debug('setting common globals!');
        const PRESETS = this.presets;
        const PRELOADS = this.preloads;

        this.globals = true;

        baseDir = baseDir || __dirname;
        baseDir = baseDir.replace(/\/+$/,'')+'/';// remove trailing slashes
        global.__home = baseDir;

        PRESETS.modules && (global.__modules = __home+"modules/");

        PRESETS.json && (global.__jsonPath = baseDir+'data/');
        PRESETS.data && (global.__data = baseDir+'data/');

        PRESETS.helpers && (global.__helpers = baseDir+'helpers/');

        PRESETS.config && (global.__config = baseDir+'configs/');
        PRESETS.lang && (global.__lang = __config+'lang');
        PRESETS.middleware && (global.__middleware = baseDir+'middleware/');
        PRESETS.public && (global.__public = baseDir+'public/');
        PRESETS.images && (global.__images = __public+'images/');

        PRELOADS.mysql && (global.dbo = this.loadHelper('mysql'));

        const paths = require('path');
        const basename = paths.basename(__home);

        // https://stackoverflow.com/questions/8683895/how-do-i-determine-the-current-operating-system-with-node-js
        const platform = process.platform;// 'darwin', 'freebsd', 'linux', 'sunos' or 'win32'
        global.__isMac = Boolean(platform.match(/darwin/i));
        debug('isMac ?', __isMac && 'Yes' || 'No');
        
        global.__isLocal = (__isMac || platform.match(/win32/i));
        __isLocal = false;//TODO:Remove this hardcoding
        debug('isLocal ?', __isLocal && 'Yes' || 'No');

        if(PRESETS.mode) {
            global.__mode = !(__isMac || __isLocal) ?(basename.match(/live/i) ?'live' :'dev') :"local";
            //set mode to DEV for debug mode
            /*if(process.env.DEBUG) {
                global.__mode = 'dev';//TODO: Remove this before deploying
            }*/
            debug('__mode: ', __mode);
        }

        if(PRESETS.api) {
            global.__api = __mode==='live' ?'/prod' :(__isMac || __isLocal ?'' :'/dev');
            debug('__api: ', __api);
        }
    },
    setRequestGlobals: function(req, res, next) {
        const protocol = 'http' +((req.connection && req.connection.encrypted && 's') || '')+'://';
        global.__server = protocol+req.headers.host;//contains path ONLY upto server AND DOES NOT POINT to specific API environment
        global.__apiPath = __server+__api;//contains for API referred by this request
        next();
    },
    loadHelper: function (name) {
        const baseUrl = __helpers;
        if(typeof helpers!=='undefined' && helpers.list[name])
            return require(baseUrl+helpers.list[name]);
        let helperModule = null;
        try {
            helperModule = require(baseUrl+name);
        } catch(e) {
            const esHelperName = 'es-helper-'+name.replace(/^es-helper-/i,'');
            helperModule = require(esHelperName);
        }
        return helperModule;
    },

    getAppInfoFromStore: function(packageId, callback) {
        var gplay = require('google-play-scraper');
        gplay.app({appId: packageId})
        .then(success=>callback(null, success), callback);
    },
    location: require('./location-util'),
    // removed: .loadModules function

    parentUrl: function(url) {
        return url.substr(0, url.lastIndexOf('/'));
    },
    copy: function (objArr) {
        return objArr ?JSON.parse(JSON.stringify(objArr)) :objArr;
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
    get: function (key) {
        key = key.toLowerCase().split(':');
        switch(key[0]) {
            case 'date':
            case 'timestamp':
            case 'ts':
                if(key==='ts' || key==='timestamp') {
                    // return Math.floor(Date.now() / 1000);//is buggy
                    var ts = +new Date;
                    return ts;
                }
                var d = new Date();

                var format = (key[1] || 'dd-mm-yy').toLowerCase().split('-');
                var data = [];
                format.forEach(function (field) {
                    if(field=='dd')
                        data.push(d.getDate());
                    else if(field=='mm')
                        data.push(('0'+(d.getMonth()+1)).substr(-2));
                    else if(field=='yy')
                        data.push(d.getFullYear());
                });
                return data.join('-');
                break;
        }
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
    },
    queryStringToJSON: function (str) {
        if(typeof str!=='string' || !(str.match(/(.*=.*&?)+/)))
            return str;
        const advancedQueryString = require('qs');
        let parsed = advancedQueryString.parse(str, {depth: 10});
        console.log("parsed queryToJSON: ", parsed);

        return parsed;
    }
};