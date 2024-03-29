module.exports = {
  use: function (name) {
    name = name || "";
    switch (name.toLowerCase()) {
      case "ipstack":
        return this.ipStack;
      case "ipdata":
        return this.ipData;
      case "ipinfo":
        return this.ipInfo;
      default:
        return this.ipStack;
    }
  },
  ipInfo: {
    apiKey: null,
    apiPath: "https://ipinfo.io/",
    setApiKey: function (keys) {
      keys = Array.isArray(keys) ? keys : [keys];
      let index = 0;
      if (keys.length > 1) {
        index = Math.round(Math.random() * keys.length);
      }
      this.apiKey = keys[index];
    },
    setFields: function (fields) {
      this.fields = fields || this.fields;
    },
    getGeo: function (params, callback) {
      params = params || {};
      params.fields = "geo";
      return this.getIpInfo(params, callback);
    },
    getIpInfo: function (params, callback) {
      let ip = params.ip || "";
      let localIPs = ["::ffff:127.0.0.1", "::1", "127.0.0.1"];
      if (localIPs.indexOf(ip) >= 0) {
        ip = ""; //get requester details if request is from localhost
      }
      let url = this.apiPath + ip;
      if (params.field || params.fields) {
        let field = params.field || params.fields;
        url += "/" + (field === true ? this.fields : field);
      }
      url = url.replace(/\/+$/, "");
      url += "?token=" + this.apiKey;

      const axios = require("axios");
      return axios
        .get(url, {
          headers: {
            Accept: "application/json",
          },
        })
        .then(({ data }) => {
          const json = data;
          json.location = json.loc.split(",");
          json.latittude = json.location[0];
          json.longitude = json.location[1];
          return callback(null, json);
        })
        .catch(callback);
    },
  },
  ipData: {
    apiKey: null,
    apiPath: "https://api.ipdata.co/",
    setApiKey: function (keys) {
      keys = Array.isArray(keys) ? keys : [keys];
      let index = 0;
      if (keys.length > 1) {
        index = Math.round(Math.random() * keys.length);
      }
      this.apiKey = keys[index];
    },
    setFields: function (fields) {
      this.fields = fields || this.fields;
    },
    getIpInfo: function (params, callback) {
      let ip = params.ip || "";
      let localIPs = ["::ffff:127.0.0.1", "::1", "127.0.0.1"];
      if (localIPs.indexOf(ip) >= 0) {
        ip = ""; //get requester details if request is from localhost
      }
      let url = this.apiPath + ip;
      if (params.field || params.fields) {
        let field = params.field || params.fields;
        url += "/" + (field === true ? this.fields : field);
      }
      url = url.replace(/\/+$/, "");
      url += "?api-key=" + this.apiKey;

      const axios = require("axios");
      return axios
        .get(url)
        .then(({ data }) => callback(null, data))
        .catch(callback);
    },
  },
  ipStack: {
    apiKey: null,
    apiPath: "http://api.ipstack.com/",
    setApiKey: function (keys) {
      keys = Array.isArray(keys) ? keys : [keys];
      let index = 0;
      if (keys.length > 1) {
        index = Math.round(Math.random() * keys.length);
      }
      this.apiKey = keys[index];
    },
    setFields: function (fields) {
      this.fields = fields || this.fields;
    },
    getIpInfo: function (params, callback) {
      let ip = params.ip || "";
      let localIPs = ["::ffff:127.0.0.1", "::1", "127.0.0.1"];
      if (localIPs.indexOf(ip) >= 0 || !ip) {
        ip = "check"; //get requester details if request is from localhost
      }
      let url = this.apiPath + ip + "?access_key=" + this.apiKey;

      if (params.field || params.fields) {
        let field = params.field || params.fields;
        field += field === true ? this.fields : field;
        field = Array.isArray(field) ? field.join(",") : field;
        if (field) {
          url += "&fields=" + field;
        }
      }

      const axios = require("axios");
      return axios
        .get(url)
        .then(({ data }) => callback(null, data))
        .catch(callback);
    },
  },
};
