import AWS = require('aws-sdk');

AWS.config.loadFromPath('./awsconfig.json');



class AWSHelper{
  static s3 = new AWS.S3();
  static rekognition = new AWS.Rekognition();
  static bucketName = 'incrm.whosabsent';
  static rekCollectionID = "whosabsent";
  static testS3(){
    var params = {
      Bucket: AWSHelper.bucketName, /* required */
      Key: 'students/emma/emma1.jpg', /* required */
    };
    AWSHelper.s3.getObject(params, function(err, data) {
      if (err) console.log(err, err.stack); // an error occurred
      else     console.log(data);           // successful response
    });
  }

  static createRekCollection(callback){
    var params = {
     CollectionId: AWSHelper.rekCollectionID
    };
    AWSHelper.rekognition.createCollection(params, callback);
  }
  static deleteRekCollection(callback){
      var params = {
       CollectionId: AWSHelper.rekCollectionID
      };
      AWSHelper.rekognition.deleteCollection(params, callback);
    }
  static fetchFaces(){
    var params = {
      CollectionId: AWSHelper.rekCollectionID, 
      MaxResults: 20
     };
    AWSHelper.rekognition.listFaces(params, function(err, data) {
     if (err) console.log(err, err.stack); // an error occurred
     else     console.log(data); 
    });
  }
  static deleteFace(faceId, callback){
    var params = {
      CollectionId: AWSHelper.rekCollectionID, 
      FaceIds: [
         faceId
      ]
     };
   AWSHelper.rekognition.deleteFaces(params, callback);
    
  }
  static registerFace(key,id,callback){
    var params = {
      CollectionId: AWSHelper.rekCollectionID, 
      Image: { /* required */
        S3Object: {
          Bucket: AWSHelper.bucketName,
          Name: key
        }
      },
      DetectionAttributes: [
      ],
      ExternalImageId: id
    };
    AWSHelper.rekognition.indexFaces(params, function(err, data) {
      if (err){
        callback(err,undefined);
        console.log(err, err.stack); // an error occurred
      }
      else {
        console.log('data from indexface register');
        console.log(data);           // successful response
        callback(undefined,data);
      }
    });
    
  }
  static searchFaces(key, callback){
    var params = {
     CollectionId: AWSHelper.rekCollectionID, 
     FaceMatchThreshold: 75, 
     Image: {
      S3Object: {
       Bucket: AWSHelper.bucketName,
       Name: key
      }
     }, 
     MaxFaces: 5
    };
    AWSHelper.rekognition.searchFacesByImage(params, callback);
  }
}

export = AWSHelper;