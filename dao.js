var DAO = function(){
	this.logSQL = false;
	this.logErr = true;
	this.preDb = function(data){return data;};
	this.preSend = function(data){return data;};
	this.postRecv = function(data){return data;};
};

DAO.prototype.columns={
};

DAO.prototype.primaryKeys={
};

DAO.prototype.reg = function (tableName, columns, primaryKey){
	tableName = tableName.toUpperCase();
	console.log(this);
	this.columns[tableName] = columns.slice(0);
	this.primaryKeys[tableName] = primaryKey;
};

DAO.prototype.n2e = function (param){
	if (param === undefined)
		return "";
	return param;
}

DAO.prototype.vq = function (num){
	if (num == 0)
		return "()";
	var ss = [];
	for (var i = 0; i < num; i ++)
		ss.push("?");;
	return "(" + ss.join(",") + ")";
};

DAO.prototype.vq2 = function (rownum, colnum){
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

DAO.prototype.get = function (resultSet, object){
	object = object || new Object();
	var item = resultSet.rows.item(0);
	for (var p in item)
		object[p] = item[p];
	return object;
};

DAO.prototype.getI = function objectFromResultSetI(resultSet, index, object){
	object = object || new Object();
	var item = resultSet.rows.item(index);
	for (var p in item)
		object[p] = item[p];
	return object;
};

DAO.prototype.getAll = function arrayFromResultSet(resultSet){
	var len = resultSet.rows.length;
	var arr = [];
	for (var i = 0; i < len; i ++)
		arr.push(this.getI(resultSet, i));
	return arr;
};

DAO.prototype.SqlHandler = function SqlHandler(){
	this.success = undefined;
	this.rowsAffected = 0;
	this.error = undefined;
	this.result = undefined;
}


DAO.prototype.SqlHandler.prototype.winCB = function(callback){
	self = this;
	return function(transaction, resultSet){
		self.success = true;
		self.rowsAffected = resultSet.rowsAffected;
		if (callback)
			callback(self, transaction);
	}
}

DAO.prototype.SqlHandler.prototype.errorCB = function (callback){
	self = this;
	return function(transaction, error){
		if (this.logErr) console.log(error);
		self.success = false;
		self.error = error;
		if (callback)
			callback(self, transaction);
	}
}

DAO.prototype.SqlHandler.prototype.queryCB = function (callback){
	self = this;
	return function(transaction, resultSet){
		self.success = true;
		self.result = this.getAll(resultSet);
		if (callback)
			callback(self, transaction);
	}
}

DAO.prototype.SqlHandler.prototype.PKQCB = function (callback){
	self = this;
	return function(transaction, resultSet){
		self.success = true;
		self.result = this.getAll(resultSet);
		if (callback)
			callback(self, transaction);
	}
}

DAO.prototype.add = function (object, tableName, transaction, callback){
	tableName = tableName.toUpperCase();
	object = this.preDb(object);
	var cols = this.columns[tableName];
	var arrCol = [];
	var arrObj = [];
	console.log(cols);
	for (var i in cols){
		console.log(cols[i], object[cols[i]]);
		if (!(object[cols[i]] === undefined)){
			arrCol.push(cols[i]);
			arrObj.push(object[cols[i]]);
		}
	}
	var sql =
		"insert into " + tableName 
		+ "(" + arrCol.join(",") + ") values"
		+ this.vq(arrCol.length);
	if (this.logSQL) console.log(sql, arrObj);
	var ret = new this.SqlHandler();
	transaction.executeSql(sql, arrObj, ret.winCB(callback), ret.errorCB(callback));
}

/*DAO.prototype.addn2e = function (object, tableName, transaction, callback){
	tableName = tableName.toUpperCase();
	object = this.preDb(object);
	var cols = this.columns[tableName];
	var arrCol = [];
	var arrObj = [];
	for (var i in cols){
		arrCol.push(cols[i]);
		arrObj.push(n2e(object[cols[i]]));
	}
	var sql =
		"insert into " + tableName 
		+ "(" + arrCol.join(",") + ") values"
		+ this.vq(arrCol.length);
	if (this.logSQL) console.log(sql, arrObj);
	var ret = new this.SqlHandler();
	transaction.executeSql(sql, arrObj, ret.winCB(callback), ret.errorCB(callback));
}*/

DAO.prototype.edit = function (object, tableName, transaction, callback){
	tableName = tableName.toUpperCase();
	object = this.preDb(object);
	var pk = this.primaryKeys[tableName];
	var cols = this.columns[tableName];
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
		+ this.vq(arrCol.length);
	if (this.logSQL) console.log(sql, arrObj);
	var ret = new this.SqlHandler();
	transaction.executeSql(sql, arrObj, ret.winCB(callback), ret.errorCB(callback));
}

/*DAO.prototype.addAll = function (array, tableName, transaction, callback, isTidy){
	tableName = tableName.toUpperCase();
	var bak = array;
	array = [];
	for (var i in bak)
		array.push(this.preDb(bak[i]));
	var cols = this.columns[tableName];
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
	var sql = 
		"insert into " + tableName
		+ "(" + arrCol.join(",") + ") values"
		+ this.vq(arrCol.length);
	for (var i in array){
		var cObj = array[i];
		for (var p in arrCol)
			arrObj[i] = cObj[cols[i]];
		if (this.logSQL) console.log(sql, arrObj);
		var ret = new this.SqlHandler();
		transaction.executeSql(sql, arrObj, ret.winCB(callback), ret.errorCB(callback));
		arrObj.push(cObj[arrCol[p]]);
	}
}*/

DAO.prototype.findAll = function (key, tableName, transaction, callback){
	tableName = tableName.toUpperCase();
	var arrCol = [];
	var arrObj = [];
	for (var p in key){
		arrCol.push(p + " = ?");
		arrObj.push(key[p]);
	}
	var sql = 
		"select * from " + tableName
		+ " where " + arrCol.join(" and ");
	if (this.logSQL) console.log(sql, arrObj);
	var ret = new this.SqlHandler();
	transaction.executeSql(sql, arrObj, ret.queryCB(callback), ret.errorCB(callback));
}

DAO.prototype.find = function (PK, tableName, transaction, callback){
	tableName = tableName.toUpperCase();
	var sql = 
		"select * from " + tableName
		+ " where " + this.__primaryKeys[tableName] + " = ?";
	if (this.logSQL) console.log(sql, [pk]);
	var ret = new this.SqlHandler();
	transaction.executeSql(sql, [PK], ret.PKQCB(callback), ret.errorCB(callback));
}

DAO.prototype.delAll = function (key, tableName, transaction, callback){
	tableName = tableName.toUpperCase();
	var arrCol = [];
	var arrObj = [];
	for (var p in key){
		arrCol.push(p + " = ?");
		arrObj.push(key[p]);
	}

	var sql =
		"delete from " + tableName
		+ " where " +  arrCol.join(" and ");
	if (this.logSQL) console.log(sql, arrObj);
	var ret = new this.SqlHandler();
	transaction.executeSql(sql, arrObj, ret.winCB(callback), ret.errorCB(callback));
}

DAO.prototype.del = function (PK, tableName, transaction, callback){
	tableName = tableName.toUpperCase();
	var sql = 
		"delete from " + tableName
		+ " where " + this.primaryKeys[tableName] + " = ?";
	if (this.logSQL) console.log(sql, [PK]);
	var ret = new this.SqlHandler();
	transaction.executeSql(sql, [PK], ret.winCB(callback), ret.errorCB(callback));
}

/*DAO.prototype.merge = function(baseobj, anotherobj, overwrite){
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

DAO.prototype.nmerge = function(obj1, obj2, overwrite){
	var ret = {};
	this.merge(ret, obj1);
	this.merge(ret, obj2, overwrite);
	return ret;
}*/

DAO.prototype.recv = function (url, method, parameters, format){
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
	var postRecv = this.postRecv;
	$.ajax({
		url : url,
		type : method,
		async : false,
		data : data,
		dataType : "json",
		success : function(json){
			ret = postRecv(json);
		},
		error : function(e){
			if (this.logErr)
				console.log(e);
		}
	});
	return ret;
}

/*var isArray = function(obj) {
	return Object.prototype.toString.call(obj) === '[object Array]';
}; 

DAO.prototype.send = function(object, url, callback){
	var forsend;
	if (isArray(object)){
		var data = [];
		for (var i in object)
			data[i] = this.preSend(object[i]);
		forsend = JSON.stringify(data);
	} else
		forsend = JSON.stringify(this.preSend(object));
	$.ajax({
		url : url,
		type : "post",
		async : false,
		data : forsend,
		dataType : "json",
		success : function(json){
			ret = json;
			callback(ret);
		},
		error : function(e){
			if (this.logErr)
				console.log(e);
		}
	});

}*/

DAO.prototype.index = function(tableName, fields, tx){
	var sql = 
		"create index " + tableName + "_" + fields.join("_") + " on "
		+ tableName + "(" + fields.join(",") + ")";
	if (this.logSQL) 
		console.log(sql);
	tx.executeSql(sql);
}
