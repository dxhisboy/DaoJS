#DaoJS

A DAO framework for WebSQL and Cordova Sqlite Plugin.

##HighLight

No code generation is needed to run this library.

Transaction is used as calling db.transaction, I didn't cover.

Both short method name or complex method name version.

##Usage

Just link to either of the dao.js before use.

Config DAO.columns and DAO.primaryKeys in this format:

    DAO.columns = {
        example : ["rowid", "rowdata"]
    }
    DAO.primaryKeys = {
        example : "rowid"
    }
    //If table example contains two columns rowid and rowdata and rowid is primary key.

Call methods in transactions like.

    var db = openDatabase("dbname", '1.0', 'name', size);
    db.transaction(function (tx){
        DAO.add('["rowid" : 1, "rowdata" : 1]', 'example', tx, function (rt, tx){
                console.log(rt);
            }
        );
    });
    
##Methods

###void DAO.reg(String tablename, String[] columns, String primaryKey)

Add a table information to DAO's table list, for editing table schama on-the-fly.

+ **String tablename**: table name in string.
+ **String[] tablename**: array of column names in string.
+ **String primaryKey**: name of the primamry key column. Multi-column primary key is not supported.

###Object DAO.get(ResultSet resultSet, optional Object object)
Get first object from a resultset.

+ **ResultSet resultSet**: a standard result of an WebSQL query.
+ **optional Object object**: an object for buffer use, if not defined, a new object is created.
+ **returns**: the first object in the resultset.

###Object DAO.getI(ResultSet resultSet, Number index, optional Object object)
Get the i-th object from a resultset.

+ **ResultSet resultSet**: a standard result of an WebSQL query.
+ **Number index**: index of the object.
+ **optional Object object**: an object for buffer use, if not defined, a new object is created.
+ **returns**: return the i-th object in the resultset.

###Object[] DAO.getAll(@ResultSet resultSet)
Get all objects from a resultset.

+ **ResultSet resultSet**: a standard result of an WebSQL query.
+ **returns**: an array containing all objects in the resultset.


