## If $1 is not passed, set to the current working dir using $PWD
## execute via ./load_tables.sh data
### if the user does not specifiy a directory default it to the directory 'data'
_dir="${1:-'data'}"

echo "Loading file into hadoop with > hadoop fs -put $_dir /data"

### check to see if the data directory already exists inside hadoop.
### if not create it

##hadoop fs -test –d /data 
##if [ $? -eq 1 ] ; then
## echo "data directory exists"
##else
  hadoop fs -mkdir /data
##  echo “Creating /data directory”
##fi

### put the data files from the local directory passed in, into the hadoop /data directory

hadoop fs -put ${_dir}/* /data
echo "put the $_dir into hdfs. "
echo "running the tables.hql file"
### run the hive script to create the tables and load the data into the tables.
hive -f tables.hql
