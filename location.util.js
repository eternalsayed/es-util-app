module.exports = {
    use: function(name) {
        name = name || '';
        switch(name.toLowerCase()) {
            case 'ipstack':
                return this.ipStack;
            case 'ipdata':
                return this.ipData;
            case 'ipinfo':
                return this.ipInfo;
            default:
                return this.ipStack;
        }
    },
    ipInfo: {
        apiKey: null,
        apiPath: 'https://ipinfo.io/',
        setApiKey: function(keys) {
            keys = Array.isArray(keys) ?keys :[keys];
            let index = 0;
            if(keys.length>1) {
                index = Math.round(Math.random()*keys.length);
            }
            this.apiKey = keys[index];
        },
        setFields: function(fields) {
            this.fields = fields || this.fields;
        },
        getGeo: function(params, callback) {
            params = params || {};
            params.fields = 'geo';
            return this.getIpInfo(params, callback);
        },
        getIpInfo: function(params, callback) {
            let ip = params.ip || '';
            let localIPs = ['::ffff:127.0.0.1', '::1', '127.0.0.1'];
            if(localIPs.indexOf(ip)>=0) {
                ip = '';//get requester details if request is from localhost
            }
            let url = this.apiPath + ip;
            if(params.field || params.fields) {
                let field = params.field || params.fields;
                url += '/'+(field===true ?this.fields :field);
            }
            url = url.replace(/\/+$/, '');
            url += '?token='+this.apiKey;
            
            let request = require('request');
            let config = {
                method: 'GET',
                url: url,
                headers: {
                    Accept: "application/json"
                }
            };
            return request(config, function(err, res, body) {
                let json = body;
                if(!err) {
                    try {
                        json = JSON.parse(json);
                    }catch(e) {}
                    if(json && json.loc) {
                        json.location = json.loc.split(',');
                        json.latittude = json.location[0];
                        json.longitude = json.location[1];
                    }
                }
                callback ?callback(err, json) :null;
            });
        },
    },
    ipData: {
        apiKey: null,
        apiPath: 'https://api.ipdata.co/',
        setApiKey: function(keys) {
            keys = Array.isArray(keys) ?keys :[keys];
            let index = 0;
            if(keys.length>1) {
                index = Math.round(Math.random()*keys.length);
            }
            this.apiKey = keys[index];
        },
        setFields: function(fields) {
            this.fields = fields || this.fields;
        },
        getIpInfo: function(params, callback) {
            let ip = params.ip || '';
            let localIPs = ['::ffff:127.0.0.1', '::1', '127.0.0.1'];
            if(localIPs.indexOf(ip)>=0) {
                ip = '';//get requester details if request is from localhost
            }
            let url = this.apiPath + ip;
            if(params.field || params.fields) {
                let field = params.field || params.fields;
                url += '/'+(field===true ?this.fields :field);
            }
            url = url.replace(/\/+$/, '');
            url += '?api-key='+this.apiKey;
            
            let request = require('request');
            return request.get(url, null, function(err, res, body) {
                let json = body;
                if(!err) {
                    try {
                        json = JSON.parse(json);
                    }catch(e) {}
                }
                callback ?callback(err, json) :null;
            });
        },
    },
    ipStack: {
        apiKey: null,
        apiPath: 'http://api.ipstack.com/',
        setApiKey: function(keys) {
            keys = Array.isArray(keys) ?keys :[keys];
            let index = 0;
            if(keys.length>1) {
                index = Math.round(Math.random()*keys.length);
            }
            this.apiKey = keys[index];
        },
        setFields: function(fields) {
            this.fields = fields || this.fields;
        },
        getIpInfo: function(params, callback) {
            let ip = params.ip || '';
            let localIPs = ['::ffff:127.0.0.1', '::1', '127.0.0.1'];
            if(localIPs.indexOf(ip)>=0 || !ip) {
                ip = 'check';//get requester details if request is from localhost
            }
            let url = this.apiPath + ip + '?access_key='+this.apiKey;
            
            if(params.field || params.fields) {
                let field = params.field || params.fields;
                field += (field===true ?this.fields :field);
                field = Array.isArray(field) ?field.join(',') :field;
                if(field) {
                    url += '&fields='+field;
                }
            }

            let request = require('request');
            return request(url, null, function(err, res, body) {
                let json = body;
                if(!err) {
                    try {
                        json = JSON.parse(json);
                    }catch(e) {}
                }
                callback ?callback(err, json) :null;
            });
        }
    }
}