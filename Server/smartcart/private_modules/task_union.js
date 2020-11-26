module.exports.doubleTask = function(parameter, commonTask, typeATask, typeBTask) {
    return new Promise(function(resolve, reject) {
        if(parameter) resolve(commonTask.concat(typeATask));
        else resolve(commonTask.concat(typeBTask));
    });
}