var DAO = {
	logSQL : true,
	logErr : true

};
DAO.columns={
};

DAO.primaryKeys={
};

DAO.reg = function (tableName, columns, primaryKey){
	DAO.columns[tableName] = columns.slice(0);
	DAO.primaryKeys[tableName] = primaryKey;
};

DAO.vq = function (num){
	if (num == 0)
		return "()";
	var ss = [];
	for (var i = 0; i < num; i ++)
		ss.push("?");;
	return "(" + ss.join(",") + ")";
};

DAO.vq2 = function (rownum, colnum){
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

DAO.get = function (resultSet, object){
	object = object || new Object();
	var item = resultSet.rows.item(0);
	for (var p in item)
		object[p] = item[p];
	return object;
};

DAO.getI = function objectFromResultSetI(resultSet, index, object){
	object = object || new Object();
	var item = resultSet.rows.item(index);
	for (var p in item)
		object[p] = item[p];
	return object;
};

DAO.getAll = function arrayFromResultSet(resultSet){
	var len = resultSet.rows.length;
	var arr = [];
	for (var i = 0; i < len; i ++)
		arr.push(DAO.getI(resultSet, i));
	return arr;
};

DAO.SqlHandler = function SqlHandler(){
	this.success = undefined;
	this.rowsAffected = 0;
	this.error = undefined;
	this.result = undefined;
}


DAO.SqlHandler.prototype.winCB = function(callback){
	self = this;
	return function(transaction, resultSet){
		self.success = true;
		self.rowsAffected = resultSet.rowsAffected;
		if (callback)
			callback(self, transaction);
	}
}

DAO.SqlHandler.prototype.errorCB = function (callback){
	self = this;
	return function(transaction, error){
		if (DAO.logErr) console.log(error.message);
		self.success = false;
		self.error = error;
		if (callback)
			callback(self, transaction);
	}
}

DAO.SqlHandler.prototype.queryCB = function (callback){
	self = this;
	return function(transaction, resultSet){
		self.success = true;
		self.result = DAO.getAll(resultSet);
		if (callback)
			callback(self, transaction);
	}
}

DAO.SqlHandler.prototype.PKQCB = function (callback){
	self = this;
	return function(transaction, resultSet){
		self.success = true;
		self.result = DAO.getAll(resultSet);
		if (callback)
			callback(self, transaction);
	}
}

DAO.add = function (object, tableName, transaction, callback){
	var cols = DAO.columns[tableName];
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
		+ DAO.vq(arrCol.length);
	if (DAO.logSQL) console.log(sql, arrObj);
	var ret = new DAO.SqlHandler();
	transaction.executeSql(sql, arrObj, ret.winCB(callback), ret.errorCB(callback));
}

DAO.edit = function (object, tableName, transaction, callback){
	var pk = DAO.primaryKeys[tableName];
	var cols = DAO.columns[tableName];
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
		+ DAO.vq(arrCol.length);
	if (DAO.logSQL) console.log(sql, arrObj);
	var ret = new DAO.SqlHandler();
	transaction.executeSql(sql, arrObj, ret.winCB(callback), ret.errorCB(callback));
}

DAO.addAll = function (array, tableName, transaction, callback, isTidy){
	var cols = DAO.columns[tableName];
	var arrCol = [];
	var arrObj = [];
	if (array.length == 0)
		return 0;
	if (isTidy){
		var pObj = array[0];
		for (var i in cols){
			if (!(pObj[cols[i]] === undefined))
				arrCol.push(cols[i]);
		}
	} else {
		for (var i in cols){
			var def = false;
			for (var j in array)
				if (!(array[j][cols[i]] === undefined))
					def = true;
			if (def)
				arrCol.push(cols[i]);
		}
	}
	for (var i in array){
		var cObj = array[i];
		for (var p in arrCol)
			arrObj.push(cObj[arrCol[p]]);
	}
	var sql = 
		"insert into " + tableName
		+ "(" + arrCol.join(",") + ") "
		+ DAO.vq2(array.length, arrCol.length);
	if (DAO.logSQL) console.log(sql, arrObj);
	var ret = new DAO.SqlHandler();
	transaction.executeSql(sql, arrObj, ret.winCB(callback), ret.errorCB(callback));
}

DAO.findAll = function (key, tableName, transaction, callback){
	var arrCol = [];
	var arrObj = [];
	for (var p in key){
		arrCol.push(p + " = ?");
		arrObj.push(key[p]);
	}
	var sql = 
		"select * from " + tableName
		+ " where " + arrCol.join(" and ");
	if (DAO.logSQL) console.log(sql, arrObj);
	var ret = new DAO.SqlHandler();
	transaction.executeSql(sql, arrObj, ret.queryCB(callback), ret.errorCB(callback));
}

DAO.find = function (PK, tableName, transaction, callback){
	var sql = 
		"select * from " + tableName
		+ " where " + this.__primaryKeys[tableName] + " = ?";
	if (DAO.logSQL) console.log(sql, [pk]);
	var ret = new DAO.SqlHandler();
	transaction.executeSql(sql, [PK], ret.PKQCB(callback), ret.errorCB(callback));
}

DAO.delAll = function (key, tableName, transaction, callback){
	var arrCol = [];
	var arrObj = [];
	for (var p in key){
		arrCol.push(p + " = ?");
		arrObj.push(key[p]);
	}

	var sql =
		"delete from " + tableName
		+ " where " +  arrCol.join(" and ");
	if (DAO.logSQL) console.log(sql, arrObj);
	var ret = new DAO.SqlHandler();
	transaction.executeSql(sql, arrObj, ret.winCB(callback), ret.errorCB(callback));
}

DAO.del = function (PK, tableName, transaction, callback){
	var sql = 
		"delete from " + tableName
		+ " where " + DAO.primaryKeys[tableName] + " = ?";
	if (DAO.logSQL) console.log(sql, [PK]);
	var ret = new DAO.SqlHandler();
	transaction.executeSql(sql, [PK], ret.winCB(callback), ret.errorCB(callback));
}

DAO.merge(baseobj, anotherobj, overwrite){
	if (overwrite)
		for (var p in anotherobj){
			baseobj[p] = anotherobj[p];
		}
	else
		for (var p in anotherobj)
			if (baseobj[p] === undefined)
				baseobj[p] = anotherobj[p];
	return baseobj;
}

DAO.nmerge(obj1, obj2, overwrite){
	var ret = {};
	DAO.merge(ret, obj1);
	DAO.merge(ret, obj2, overwrite);
	return ret;
}

DAO.recv = function (url, method, parameters, format){
	if (method === undefined)
		method = "GET";
	method = method.toUpperCase();
	if (format === undefined){
		if (method == "GET")
			format = "URL"
		else
			format = "JSON"
	}
	format = format.toUpperCase();
	var data;
	if (format == "JSON")
		data = JSON.stringify(parameters);
	else
		data = parameters;
	var ret = undefined;
	$.ajax({
		url : url,
		type : method,
		async : false,
		data : data,
		dataType : "json",
		success : function(json){
			ret = json;
		},
		error : function(e){
			if (logErr)
				console.log(e);
		}
	});
	return ret;
}
