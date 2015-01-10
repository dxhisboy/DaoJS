var DAO = {};
DAO.__columns={
};

DAO.__primaryKeys={
};

DAO.setTable = function setTable(tableName, columns, primaryKey){
	DAO.__columns[tableName] = columns.slice(0);
	DAO.__primaryKeys[tableName] = primaryKey;
};

DAO.__vquotes = function __vquotes(num){
	if (num == 0)
		return "()";
	var ss = [];
	for (var i = 0; i < num; i ++)
		ss.push("?");;
	return "(" + ss.join(",") + ")";
};

DAO.__vquotes2 = function __vquotes2(rownum, colnum){
	if (rownum * colnum == 0)
		return "";
	var sel = [];
	for (var i = 0; i < colnum; i ++)
		sel.push("?");
	var sels = "select " + sel.join(",");
	var ss = [];
	for (var i = 0; i < rownum; i ++)
		ss.push(sels);
	return ss.join(" union all ");
};

DAO.objectFromResultSet = function objectFromResultSet(resultSet, object){
	object = object || new Object();
	var item = resultSet.rows.item(0);
	for (var p in item)
		object[p] = item[p];
	return object;
};

DAO.objectFromResultSetI = function objectFromResultSetI(resultSet, index, object){
	object = object || new Object();
	var item = resultSet.rows.item(index);
	for (var p in item)
		object[p] = item[p];
	return object;
};

DAO.arrayFromResultSet = function arrayFromResultSet(resultSet){
	var len = resultSet.rows.length;
	var arr = [];
	for (var i = 0; i < len; i ++)
		arr.push(DAO.objectFromResultSetI(resultSet, i));
	return arr;
};

DAO.SqlHandler = function SqlHandler(){
	this.success = undefined;
	this.rowsAffected = 0;
	this.error = undefined;
	this.result = undefined;
}


DAO.SqlHandler.prototype.successCallback = function(callback){
	self = this;
	return function(transaction, resultSet){
		self.success = true;
		self.rowsAffected = resultSet.rowsAffected;
		callback(self, transaction);
	}
}

DAO.SqlHandler.prototype.errorCallback = function (callback){
	self = this;
	return function(transaction, error){
		self.success = false;
		self.error = error;
		callback(self, transaction);
	}
}

DAO.SqlHandler.prototype.queryCallback = function (callback){
	self = this;
	return function(transaction, resultSet){
		self.success = true;
		self.result = DAO.arrayFromResultSet(resultSet);
		callback(self, transaction);
	}
}

DAO.SqlHandler.prototype.PKQueryCallback = function (callback){
	self = this;
	return function(transaction, resultSet){
		self.success = true;
		self.result = DAO.arrayFromResultSet(resultSet);
		callback(self, transaction);
	}
}

DAO.insertObjectToTable = function insertObjectToTable(object, tableName, transaction, callback){
	var cols = DAO.__columns[tableName];
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
		+ DAO.__vquotes(arrCol.length);
	var ret = new DAO.SqlHandler();
	transaction.executeSql(sql, arrObj, ret.successCallback(callback), ret.errorCallback(callback));
}

DAO.editObjectInTable = function editObjectInTable(object, tableName, transaction, callback){
	var pk = DAO.__primaryKeys[tableName];
	var cols = DAO.__columns[tableName];
	var arrCol = [];
	var arrObj = [];
	for (var i in cols){
		if (!(object[cols[i]] === undefined)){
			arrCol.push(cols[i]);
			arrObj.push(object[cols[i]]);
		}
	}
	var sql =
		"insert or replace into " + tableName 
		+ "(" + arrCol.join(",") + ") values"
		+ DAO.__vquotes(arrCol.length);
	var ret = new DAO.SqlHandler();
	transaction.executeSql(sql, arrObj, ret.successCallback(callback), ret.errorCallback(callback));
}

DAO.insertTidyArrayToTable = function insertTidyArrayToTable(array, tableName, transaction, callback){
	var cols = DAO.__columns[tableName];
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
			arrObj.push(cObj[arrCol[p]]);
	}
	var sql = 
		"insert into " + tableName
		+ "(" + arrCol.join(",") + ") "
		+ DAO.__vquotes2(array.length, arrCol.length);
	var ret = new DAO.SqlHandler();
	transaction.executeSql(sql, arrObj, ret.successCallback(callback), ret.errorCallback(callback));
}

DAO.insertArrayToTable = function insertArrayToTable(array, tableName, transaction, callback){
	var cols = DAO.__columns[tableName];
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
			arrObj.push(cObj[arrCol[p]]);
	}
	var sql = 
		"insert into " + tableName
		+ "(" + arrCol.join(",") + ") "
		+ DAO.__vquotes2(array.length, arrCol.length);
	var ret = new DAO.SqlHandler();
	transaction.executeSql(sql, arrObj, ret.successCallback(callback), ret.errorCallback(callback));
}

DAO.find = function find(key, tableName, transaction, callback){
	var arrCol = [];
	var arrObj = [];
	for (var p in key){
		arrCol.push(p + " = ?");
		arrObj.push(key[p]);
	}
	var sql = 
		"select * from " + tableName
		+ " where " + arrCol.join(" and ");
	var ret = new DAO.SqlHandler();
	transaction.executeSql(sql, arrObj, ret.queryCallback(callback), ret.errorCallback(callback));
}

DAO.findPK = function findPK(PK, tableName, transaction, callback){
	var sql = 
		"select * from " + tableName
		+ " where " + DAO.__primaryKeys[tableName] + " = ?";
	var ret = new DAO.SqlHandler();
	transaction.executeSql(sql, [PK], ret.PKQueryCallback(callback), ret.errorCallback(callback));
}

DAO.remove = function remove(key, tableName, transaction, callback){
	var arrCol = [];
	var arrObj = [];
	for (var p in key){
		arrCol.push(p + " = ?");
		arrObj.push(key[p]);
	}

	var sql =
		"delete from " + tableName
		+ " where " +  arrCol.join(" and ");
	var ret = new DAO.SqlHandler();
	transaction.executeSql(sql, arrObj, ret.successCallback(callback), ret.errorCallback(callback));
}

DAO.removePK = function removePK(PK, tableName, transaction, callback){
	var sql = 
		"delete from " + tableName
		+ " where " + DAO.__primaryKeys[tableName] + " = ?";
	var ret = new DAO.SqlHandler();
	transaction.executeSql(sql, [PK], ret.PKQueryCallback(callback), ret.errorCallback(callback));
}

