#DaoJS

A DAO framework for WebSQL and Cordova Sqlite Plugin.

##HighLight

No code generation is needed to run this library.

Transaction is used as calling db.transaction, I didn't cover.


##Usage

Just link to either of the dao.js before use.

Configuration sample is uploaded.

Config tables in this format:

    var dao = new DAO();
    dao.columns = {
        example : ["rowid", "rowdata"]
    }
    dao.primaryKeys = {
        example : "rowid"
    }
    //Code above means table "example" contains two columns rowid and rowdata and rowid is primary key.

Call methods in transactions like.

    var db = openDatabase("dbname", '1.0', 'name', size);
    db.transaction(function (tx){
        dao.add('["rowid" : 1, "rowdata" : 1]', 'example', tx, function (rt, tx){
                console.log(rt);
            }
        );
    });

##Callbacks
All callbacks is like *function(state, transaction)*, *state* is an Object like:

    {
        success : true or false,
        rowsAffected : a number,
        error : SQLError Ojbect,
        result : Object of selection result
    }

and *transaction* is the transaction which executes the function via.
There are following kinds of callbacks:

+ **errorCallback**: for all types of database operations, success and error is set in *state*
+ **successCallback**: for non-selection functions, like *DAO.add*, *DAO.edit*, *DAO.del* or *DAO.delAll*, success and rowsAffected is set in *state*.
+ **queryCallback**: for *DAO.findAll*, success and result is set in *state*, result will be an array.
+ **primaryKeyQueryCallback**: for *DAO.find*, success and result is set in *state*, result will be an json object.

##Hooks

*DAO.preDb(object)* preprocesses an object before inseration, and *DAO.postRecv* processes *DAO.recv*'s result before use.

##Methods

###void DAO.reg(String tablename, String[] columns, String primaryKey)

Add a table information to DAO's table list, for editing table schama on-the-fly.

+ **String tablename**: table name in string.
+ **String[] tablename**: array of column names in string.
+ **String primaryKey**: name of the primamry key column. Multi-column primary key is not supported.


###void DAO.index(String tableName, String[] fields, SQLTransaction transaction)
Create index on tableName(fields).

+ **String tableName**: table to create index on.
+ **String[] fields**: fields to create index on.
+ **SQLTransaction transaction**: transaction for executing SQL.

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

###Object[] DAO.getAll(ResultSet resultSet)
Get all objects from a resultset.

+ **ResultSet resultSet**: a standard result of an WebSQL query.
+ **returns**: an array containing all objects in the resultset.

###void DAO.add(Object object, String tableName, SQLTransaction transaction, DaoCallback callback)
Add an object to a table via transaction.

+ **Object object**: a standard json object to insert to the table, will be preprocessed by this DAO instance's preDb method.
+ **String tableName**: table for insert to.
+ **SQLTransaction transaction**: transaction for executing SQL.
+ **DaoCallback callback**: callback after inseration.

###void DAO.edit(String object, String tableName, SQLTransaction transaction, DaoCallback callback)
Add an object to a table via transaction, on conflict, replace it.

+ **String object**: a standard json object to insert or replace to the table, will be preprocessed by this DAO instance's preDb method.
+ **String tableName**: table for editting.
+ **SQLTransaction transaction**: transaction for executing SQL.
+ **DaoCallback callback**: callback after inseration or replaction.

###void DAO.findAll(Object condition, String tableName, SQLTransaction transaction, DaoCallback callback)
Find object from table, where column[p] = key[p], less than and more than is not currently supported.

+ **Object key**: a standard json object, forms by KV-pair.
+ **String tableName**: table to find object from.
+ **SQLTransaction transaction**: transaction for executing SQL.
+ **DaoCallback callback**: callback to process the result.

###void DAO.find(Object PK, String tableName, SQLTransaction transaction, DaoCallback callback)
Find object from table, whose primary key equals PK.

+ **Object PK**: String, Date or Number, which is the primary key to find, multiple primary key is not currently supported.
+ **String tableName**: table to find object from.
+ **SQLTransaction transaction**: transaction for executing SQL.
+ **DaoCallback callback**: callback to process the result.

###void DAO.delAll(Object condition, String tableName, SQLTransaction transaction, DaoCallback callback)
Delete object from table, where column[p] = key[p], less than and more than is not currently supported.

+ **Object key**: a standard json object, forms by KV-pair.
+ **String tableName**: table to find object from.
+ **SQLTransaction transaction**: transaction for executing SQL.
+ **DaoCallback callback**: callback to process the result.


###void DAO.del(Object PK, String tableName, SQLTransaction transaction, DaoCallback callback)
Delete object from table, whose primary key equals PK.

+ **Object PK**: String, Date or Number, which is the primary key to delete, multiple primary key is not currently supported.
+ **String tableName**: table to find object from.
+ **SQLTransaction transaction**: transaction for executing SQL.
+ **DaoCallback callback**: callback to process the result.

###Object DAO.recv(String url, optional String method, optional Object parameters, optional String format)
Receive object from network, usually via http or https.

+ **String url**: base url to request to.
+ **optional String method**: method, "POST" or "GET", "GET" by default.
+ **optional Object parameters**: request parameters, will be appended as query string or json string in query parameter or request body.
+ **optional String format**: "JSON" or "URL", means use parameters as json string or url encoded. By default, use "URL" for "GET" and "JSON" for "POST".


