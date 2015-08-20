
var DAO = {};

/*
 * Define logger and their level.
 */
DAO.LOG = {
	SQL : 1,
	ERR : 2,
	FUNC : 4
}
DAO.prototype.log = {
	sql : function(object){
		if (DAO.LOG.SQL & this.logLevel)
			console.log(object);
	},
	err : function(object){
		if (DAO.LOG.ERROR & this.logLevel)
			console.log(object);
	},
	func : function(object){
		if (DAO.LOG.FUNC & this.logLevel)
			console.log(object);
	}
}


/*
 * Handlers converting websql callback to an all-in-one callback.
 */

DAO.SqlHandler = function(dao, callback){
	this.dao = dao;
	this.success = undefined;
	this.rowsAffected = 0;
	this.error = undefined;
	this.result = undefined;
}
DAO.SqlHandler.prototype.writeCallback = function(callback){
	var self = this;
	return function (transaction, resultSet){
		self.success = true;
		self.insertId = resultSet.insertId;
		self.rowsAffected = resultSet.rowsAffected;
		if (callback)
			callback(self, self.dao.context, transaction);
	}
}
DAO.SqlHandler.prototype.readCallback = function(callback){
	var self = this;
	return function (transaction, resultSet){
		self.success = true;
		self.result = self.dao.toJson(resultSet.rows.item(0));
		var len = resultSet.rows.length;
		self.results = [];
		for (var i = 0; i < len; i ++)
			self.results.push(self.dao.toJson(resultSet.rows.item(i)));
		if (callback)
			callback(self, self.dao.context, transaction);
	}
}
DAO.SqlHandler.prototype.errorCallback = function(callback){
	var self = this;
	return function (transaction, error){
		this.dao.log.err(error);
		self.success = false;
		self.supressed = false;
		self.error = error;
		if (callback)
			callback(self, self.dao.context, transaction);
		if (!self.supressed)
			throw error;
	}
}

/*
 * 
 */

DAO.prototype.rollbackTask = function(sql, callback){
}

DAO.prototype.readTask = function(sql, callback){
	this.run = function(transaction){
		var handler = new DAO.SqlHandler(this);
		transaction.executeSql(sql, handler.readCallback(callback), handler.errorCallback(callback));
	}
}
DAO.prototype.writeTask = function(sql, callback){
	this.run = function
}
DAO.writeTask = function(sql, callback){
}
DAO.transparent = function(data){
	return data;
}
DAO = function(dbInfo, db){
	this.dbInfo = dbInfo || {};
	this.database = db || dbinfo.database;
	this.logLevel = dbInfo.logLevel || DAO.LOG.ERROR;
	this.preInsert = dbInfo.preInsert || DAO.transparent;
	this.preSelect = dbInfo.preSelect || DAO.transparent;
	this.toJson = dbInfo.toJson || DAO.transparent;
	this.fromJson = dbInfo.fromJson || DAO.transparent;
	this.tables = dbInfo.tables || {};
}

DAO.createIndex = function(tableName, columns, transaction){
	var sql = "create index " + tableName + "_idx_" + columns.join("_") + "on " + tableName + "(" + columns.join(",") + ")";
	tx.executeSql(sql);
}
DAO.createTable = function(name, obj, transaction){
	var tableDeclear = [];
	for (var p in obj.columns)
		tableDeclear.push(p.toLowerCase() + " " + obj.columns[p]);
	if (obj.primaryKey){
		tableDeclear.push("primary key(" + obj.primaryKey.join(",") + ")");
	}
	for (var p in obj.uniques || []){
		tableDeclear.push("unique(" + obj.uniques[p].join(",") + ")");
	}
	var sql = "create " + name + "(" + tableDeclear.join(",") + ")";
	transaction.executeSql(sql, function(tx){
		for (var p in obj.indexes)
			DAO.createIndex(name, obj.indexes[p], transaction);
	});

}
DAO.prototype.migrate = function(successCB, failCB){
	var tables = this.tables;
	this.database.transaction(function (transaction){
		for (var tbl in tables){
			DAO.createTable(tbl, tables[tbl], transaction);
		}
	}
}

DAO.prototype.beginTransaction = function(){
	this.taskQueue = [];
}

DAO.prototype.findAll = function (key, tableName, callback){
}
