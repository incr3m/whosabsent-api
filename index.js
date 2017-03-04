var express = require('express');
var app = express();
var AWSHelper = require('./awshelper');
var AwsS3Form = require('aws-s3-form');

var multer = require('multer')
var multerS3 = require('multer-s3')

// AWSHelper.testS3();
// AWSHelper.createRekCollection();
// AWSHelper.registerFace('students/mina/mina1.jpg','mina');
// AWSHelper.registerFace('students/mina/mina2.jpg','mina');
// AWSHelper.registerFace('students/mina/mina3.jpg','mina');
// AWSHelper.registerFace('students/mina/mina4.jpg','mina');
// AWSHelper.fetchFaces();
//AWSHelper.searchFaces('test/test.jpg');

app.use(function(req, res, next) {
   res.header("Access-Control-Allow-Origin", "*");
   res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
   res.header("Access-Control-Allow-Headers", "X-Requested-With,Content-Type,Cache-Control");
   if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  } else {
    return next();
  }
});

app.get('/', function (req, res) {
  res.send('Hello World!');
});

var upload = multer({
  storage: multerS3({
    s3: AWSHelper.s3,
    bucket: 'incrm.whosabsent',
    acl: 'public-read',
    metadata: function (req, file, cb) {
      cb(null, {fieldName: file.fieldname});
    },
    key: function (req, file, cb) {
      // console.log('req.body');
      // console.log(req.body);
      var key;
      if(req.body.accountId)
        key = "students/"+req.body.accountId+"_"+req.body.key+".jpg";
      else
        key = "search/"+req.body.key+".jpg";
      req.body.savedKey = key;
      cb(null, key);
    }
  })
});
app.post('/search', upload.single('avatar'), function(req, res, next) {
  console.log('body');
  console.log(req.body);
  var retVal = {
    ok: 1,
    savedKey: req.body.savedKey
  };
  AWSHelper.searchFaces(retVal.savedKey,function(err, data) {
    if (err){
      console.log(err, err.stack); // an error occurred
      res.send(err);
    }
    else     {
      console.log(data);           // successful response
      for (var i = 0; i < data.FaceMatches.length; i++) {
          console.log(data.FaceMatches[i]);
      }
      res.send(data);
    }
  });
  
});

app.post('/upload', upload.single('avatar'), function(req, res, next) {
  console.log('body');
  console.log(req.body);
  var retVal = {
    ok: 1,
    accountId: req.body.accountId,
    savedKey: req.body.savedKey
  };
  AWSHelper.registerFace(retVal.savedKey,retVal.accountId);
  res.send(retVal);
});

app.get('/fetch/:id', function (req, res) {
  console.log('fetching..');
  console.log(req.params.id);
  res.redirect('https://s3-us-west-2.amazonaws.com/incrm.whosabsent/'+req.params.id);
});


app.get('/s3settings', function (req, res) {
  var key = req.query.key;

  var keyPrefix = '';
  var region = 'us-west-2';
  var bucket = 'incrm.whosabsent';
  var s3Form = new AwsS3Form({
    accessKeyId: 'AKIAICJXZHALRWXXBLZQ',
    secretAccessKey: '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',
    region:region,
    bucket:bucket,
    keyPrefix:keyPrefix,
    successActionStatus: 200,
  });
  var url = 'https://s3.'+region+'.amazonaws.com/'+bucket+'/'+keyPrefix+''+key+'';
  var formData = s3Form.create(key);
  res.send({
    bucket:bucket,
    region:region,
    url:url,
    fields: formData.fields,
  });
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});