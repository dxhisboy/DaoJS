var __tables={
	example : ["rowid", "rowdata"]
};

var __primaryKeys={
	example : "rowid"
}

function __vquotes(num){
	if (num == 0)
		return "()";
	var ss = [];
	for (var i = 0; i < num; i ++)
		ss.push("?");;
	return "(" + ss.join(",") + ")";
}

function SqlHandler(){
	this.success = undefined;
	this.rowsAffected = 0;
	this.error = undefined;
	this.result = undefined;
}

function objectFromResultSet(resultSet, object){
	object = object || new Object();
	var item = resultSet.rows.item(0);
	for (var p in item)
		object[p] = item[p];
	return object;
}

function objectFromResultSetI(resultSet, index, object){
	object = object || new Object();
	var item = resultSet.rows.item(index);
	for (var p in item)
		object[p] = item[p];
	return object;
}

function arrayFromResultSets(resultSet){
	var len = results.rows.length;
	var arr = [];
	for (var i = 0; i < len; i ++)
		arr.push(objectFromResultSetI(resultSet, index));
	return arr;
}

SqlHandler.prototype.successCallback = function(callback){
	return function(transaction, resultSet){
		this.success = true;
		this.rowsAffected = resultSet.rowsAffected;
		callback(true, resultSet.rowsAffected);
	}
}

SqlHandler.prototype.errorCallback = function (callback){
	return function(transaction, resultSet){
		this.success = false;
		this.error = error;
		callback(false, error);
	}
}

SqlHandler.prototype.queryCallback = function (callback){
	return function(transaction, resultSet){
		this.success = true;
		this.result = arrayFromResultSet(resultSet);
		callback(true, this.result);
	}
}

SqlHandler.prototype.PKQueryCallback = function (callback){
	return function(transaction, resultSet){
		this.success = true;
		this.result = arrayFromResultSet(resultSet);
		callback(true, this.result[0]);
	}
}

function insertObjectToTable(object, tableName, transaction, callback){
	var cols = __tables[tableName];
	var arrCol = [];
	var arrObj = [];
	for (var i in cols){
		if (!(object[cols[i]] === undefined)){
			arrCol.push(cols[i]);
			arrObj.push(object[cols[i]]);
		}
	}
	var sql =
		"insert into " + tableName 
		+ "(" + arrCol.join(",") + ") values"
		+ __vquotes(arrCol.length);
	var ret = new SqlHandler();
	transaction.executeSql(sql, arrObj, ret.successCallback(callback), ret.errorCallback(callback));
}

function insertTidyArrayToTable(array, tableName, transaction, callback){
	var cols = __tables[tableName];
	var arrCol = [];
	var arrObj = [];
	if (array.length == 0)
		return 0;
	var pObj = array[0];
	for (var i in cols){
		if (!(pObj[cols[i]] === undefined))
			arrCol.push(cols[i]);
	}

	for (var i in array){
		var cObj = array[i];
		for (var p in arrCol)
			arrObj.push(cObj[p]);
	}
	var sql = 
		"insert into " + tableName
		+ "(" + arrCol.join(",") + ") values"
		+ __vquotes(arrCol.length * array.length);
	var ret = new SqlHandler();
	transaction.executeSql(sql, arrObj, ret.successCallback(callback), ret.errorCallback(callback));
}

function insertArrayToTable(array, tableName, transaction, callback){
	var cols = __tables[tableName];
	var arrCol = [];
	var arrObj = [];
	if (array.length == 0)
		return 0;
	for (var i in cols){
		var def = false;
		for (var j in array)
			if (!(array[j][cols[i]] === undefined))
				def = true;
		if (def)
			arrCol.push(cols[i]);
	}

	for (var i in array){
		var cObj = array[i];
		for (var p in arrCol)
			arrObj.push(cObj[p]);
	}
	var sql = 
		"insert into " + tableName
		+ "(" + arrCol.join(",") + ") values"
		+ __vquotes(arrCol.length * array.length);
	var ret = new SqlHandler();
	transaction.executeSql(sql, arrObj, ret.successCallback(callback), ret.errorCallback(callback));
}

function find(key, tableName, transaction, callback){
	var arrCol = [];
	var arrObj = [];
	for (var p in key){
		arrCol.push(p + " = ?");
		arrObj.push(key[p]);
	}
	var sql = 
		"select * from " + tableName
		+ " where " + arrCond.join(" and ");
	var ret = new SqlHandler();
	transaction.executeSql(sql, arrObj, ret.queryCallback(callback), ret.errorCallback(callback));
}
function findPK(PK, tableName, transaction, callback){
	var sql = 
		"select * from " + tableName
		+ " where " + __primaryKeys[tableName] + " = ?";
	var ret = new SqlHandler();
	transaction.executeSql(sql, [PK], ret.PKQueryCallback(callback), ret.errorCallback(callback));
}
