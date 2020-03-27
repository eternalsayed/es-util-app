module.exports = function(config) {
    if(!config) {
        throw new Error("Config containing credentials is required for google apis");
    }
    let driveObj;
    return {
        init: function () {
            if (!driveObj) {
                const {google} = require('googleapis');
                const CREDENTIALS = config.credentials || config.auth;
                const SCOPES = config.scopes || ['https://www.googleapis.com/auth/drive'];
                const auth = new google.auth.JWT(
                    CREDENTIALS.client_email, null,
                    CREDENTIALS.private_key, SCOPES
                );
                driveObj = google.drive({version: 'v3', auth: auth});
                setTimeout(() => driveObj = null, 3600);
            }
            return driveObj;
        },
        uploadFile: function (params, callback) {
            let filePath = params.filePath;
            if (filePath.indexOf(__home) < 0) {
                filePath = (__home + filePath).replace(/\/{2,}/g, '/');
            }

            const fileName = filePath.split('/').pop().split('?')[0];

            let ext = fileName.split('.').pop();
            let mimeType;
            if (ext.match(/(jpe?g|png)/i)) {
                ext = ext.match(/jpe?g/i) ? 'jpeg' : 'png';
                mimeType = 'image/' + ext;
            } else if (['mp3', 'ogg'].indexOf(ext) >= 0) {
                mimeType = 'audio/' + ext;
            } else if (['wmv', 'mp4', 'mkv'].indexOf(ext) >= 0) {
                mimeType = 'video/' + ext;
            } else if (ext.match(/json/i)) {
                mimeType = 'text/' + ext;
            } else if (ext.match(/sql/i)) {
                mimeType = 'application/' + ext;
            }

            let parentId = params.folderId || config.folderId;
            if (!parentId) {
                return callback({code: 'PARAM_REQ', message: "Mandatory parameter folderId is missing"});
            }

            driveObj = driveObj || this.init();
            const fileMetadata = {
                name: fileName,
                mimeType: mimeType,
                description: params.desc || params.description || ('pathOnDisk: ' + filePath),
                parents: [parentId],
            };

            const fileDataObj = {
                resource: fileMetadata,
                media: {
                    mimeType: mimeType,
                    body: require('fs').createReadStream(filePath)
                },
                fields: params.fields || 'id',
            };
            driveObj.files.create(fileDataObj, function (err, json) {
                let data = json && json.data || json;

                console.log('drive-upload result: ', err, data);
                if (err || !data) {
                    console.error('DriveUpload failed:', err);
                    callback(err || {code: 'UNKNOWN_RESULT', error: err || json});
                } else {
                    console.log('File Uploaded with id:', data.id);

                    //note: has to be same as in routes/file.js for get-image API
                    // const FILE_DEST_URL = 'API_URL/files/from/gdrive/' + data.id;
                    callback(null, data.id);
                }
            });
        },
        getFileStream: function (fileId, callback) {
            driveObj = driveObj || this.init();
            return driveObj.files.get({
                fileId: fileId,
                alt: 'media'
            }, {responseType: 'stream'}, callback);
        },
        getFilesList: function (params, callback) {
            params = params || {};
            let fileType = params.type || params.fileType;
            if (fileType) {
                delete (params.fileType);
                delete (params.type);

                if (fileType.match(/image/i)) {
                    params.mimeType = 'image/jpeg';
                } else if (fileType.match(/folder/i)) {
                    params.mimeType = 'application/vnd.google-apps.folder';
                }
            }

            let listConfig = {
                fields: params.fields || 'nextPageToken, files(id, name)',
                spaces: params.spaces || 'drive',
            };
            if (params.mimeType) {
                listConfig.q = `mimeType="${params.mimeType}"`;
            }
            if (params.pageToken) {
                listConfig.pageToken = params.pageToken;
            }
            driveObj = driveObj || this.init();
            driveObj.files.list(listConfig, (err, json) => {
                if (err) {
                    return callback && callback(err);
                }
                callback && callback(null, json.data || json);
            });
        }
    }
}