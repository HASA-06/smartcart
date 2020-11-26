const multer = require('multer');
const multerS3 = require('multer-s3');
const aws = require('aws-sdk');
aws.config.loadFromPath('configs/database/aws_s3.json');
const s3 = new aws.S3();

module.exports.upload = multer({
    storage : multerS3({
        s3 : s3,
        bucket : 'smartcartpictures/goods',
        acl : 'public-read',
        key : function(req, file, cb) {
            cb(null, file.originalname.split('.')[0] + '.' + file.originalname.split('.').pop());
        }
    })
});

module.exports.delete = (s3Directory, goodImageName, callbackFunction) => {
    let deleteObjectParameter = {
        Bucket : 'smartcartpictures',
        Key : s3Directory + '/' + goodImageName
    };

    s3.deleteObject(deleteObjectParameter, (deleteObjectError) => {
        if(deleteObjectError) callbackFunction('Delete s3 picture fail\n' + deleteObjectError);
        else callbackFunction(null, 'Delete task has success');
    });
}
