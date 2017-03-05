"use strict";
var AWS = require("aws-sdk");
AWS.config.loadFromPath('./awsconfig.json');
var AWSHelper = (function () {
    function AWSHelper() {
    }
    AWSHelper.testS3 = function () {
        var params = {
            Bucket: AWSHelper.bucketName,
            Key: 'students/emma/emma1.jpg',
        };
        AWSHelper.s3.getObject(params, function (err, data) {
            if (err)
                console.log(err, err.stack);
            else
                console.log(data);
        });
    };
    AWSHelper.createRekCollection = function (callback) {
        var params = {
            CollectionId: AWSHelper.rekCollectionID
        };
        AWSHelper.rekognition.createCollection(params, callback);
    };
    AWSHelper.deleteRekCollection = function (callback) {
        var params = {
            CollectionId: AWSHelper.rekCollectionID
        };
        AWSHelper.rekognition.deleteCollection(params, callback);
    };
    AWSHelper.fetchFaces = function () {
        var params = {
            CollectionId: AWSHelper.rekCollectionID,
            MaxResults: 20
        };
        AWSHelper.rekognition.listFaces(params, function (err, data) {
            if (err)
                console.log(err, err.stack);
            else
                console.log(data);
        });
    };
    AWSHelper.registerFace = function (key, id) {
        var params = {
            CollectionId: AWSHelper.rekCollectionID,
            Image: {
                S3Object: {
                    Bucket: AWSHelper.bucketName,
                    Name: key
                }
            },
            DetectionAttributes: [],
            ExternalImageId: id
        };
        AWSHelper.rekognition.indexFaces(params, function (err, data) {
            if (err)
                console.log(err, err.stack);
            else
                console.log(data);
        });
    };
    AWSHelper.searchFaces = function (key, callback) {
        var params = {
            CollectionId: AWSHelper.rekCollectionID,
            FaceMatchThreshold: 80,
            Image: {
                S3Object: {
                    Bucket: AWSHelper.bucketName,
                    Name: key
                }
            },
            MaxFaces: 5
        };
        AWSHelper.rekognition.searchFacesByImage(params, callback);
    };
    return AWSHelper;
}());
AWSHelper.s3 = new AWS.S3();
AWSHelper.rekognition = new AWS.Rekognition();
AWSHelper.bucketName = 'incrm.whosabsent';
AWSHelper.rekCollectionID = "whosabsent";
module.exports = AWSHelper;
