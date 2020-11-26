module.exports = function(jsonArrayData, jsonDataParameter) {
    return jsonArrayData.map((data) => {return data[jsonDataParameter]});
}