const mybatisMapper = require('mybatis-mapper');

module.exports.mappingSQLStatement= function(directoryName, xmlFileName, selectSQLId, selectParameter) {
    mybatisMapper.createMapper([__base + 'mybatis/' + directoryName + '/' + xmlFileName + '.xml']);
    var format = {language : 'sql', indent : ' '};

    return mybatisMapper.getStatement(xmlFileName, selectSQLId, selectParameter, format);
}