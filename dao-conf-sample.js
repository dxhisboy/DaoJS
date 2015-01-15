var dao = new DAO();
dao.columns={
	example : ["rowid", "rowdata"]
};

dao.primaryKeys={
	example : "rowid"
};

var camel2ul = function(colname){
	var str = "";
	for (var i in colname)
		if ('A' <= colname[i] && colname[i] <= 'Z')
			str += ("_" + colname[i]).toLowerCase();
		else
			str += colname[i];
	return str;
}

var ul2camel = function(colname){
	var slices = colname.split('_');
	for (var i = 1; i < slices.length; i ++)
		slices[i] = slices[i][0].toUpperCase() + slices[i].slice(1);
	return slices.join("");
}

dao.preDb = function(object){
	var ret = {};
	for (var p in object)
		ret[camel2ul(p)] = object[p];
	ret.record_status = "vaild";
	ret.last_upd = new Date();
	return ret;
}

dao.preNet = function(object){
	var ret = {};
	for (var p in object)
		ret[ul2camel(p)] = object[p];
	return ret;
}

function logCallback(rt, tx){
	console.log(rt);
}
window.openDatabase = window.openDatabase || sqlitePlugin.openDatabase;
