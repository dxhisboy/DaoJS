var dbInfo = {
	database = window.openDatabase("test", 0, 0, 5 * 1024 * 1024);
	logLevel : DAO.LOG.SQL | DAO.LOG.ERR | DAO.FUNC,
	tables:{
		"test" : {
			columns : [
				id : "int",
				val : "text"
			],
			indexes : [
				["id", "val"]
			],
			uniques : [
				["val"]
			],
			primaryKey : [
				"id"
			],

		},
		"test1" : {
			columns : [
				{id : "int"},
				{val : "text"}
			],
			indexes : [
				["id", "val"],
				["val"]
			],
			primaryKey : [
				"id"
			]
		}

	}
}

var callback = {
	success: function (data){
		console.log(data);
	},
	error: function (data){
		console.log(data);
		throw data.error;
	}
}
