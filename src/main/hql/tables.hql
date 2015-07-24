--TABLES
!echo "******* CREATING TABLES *******";
--- Create the Master table
!echo "******* Creating Table default.master *******";
CREATE TABLE  IF NOT EXISTS default.master(
  n_number string, 
  serialnumber string, 
  mfrmdlcode string, 
  engmfrmdl bigint, 
  yearmfr bigint, 
  typeregistrant bigint, 
  name string, 
  street string, 
  street2 string, 
  city string, 
  state string, 
  zipcode bigint, 
  region string, 
  county bigint, 
  country string, 
  lastactiondate bigint, 
  certissuedate bigint, 
  certification string, 
  typeaircraft bigint, 
  typeengine bigint, 
  statuscode string, 
  modescode bigint, 
  fractowner string, 
  airworthdate bigint, 
  othernames_1 string, 
  othernames_2 string, 
  othernames_3 string, 
  othernames_4 string, 
  othernames_5 string, 
  expirationdate bigint, 
  uniqueid bigint, 
  kitmfr string, 
  kitmodel string, 
  modescodehex string, 
  empty string)
ROW FORMAT DELIMITED 
  FIELDS TERMINATED BY ',' 
STORED AS INPUTFORMAT 
  'org.apache.hadoop.mapred.TextInputFormat' 
OUTPUTFORMAT 
  'org.apache.hadoop.hive.ql.io.HiveIgnoreKeyTextOutputFormat'
TBLPROPERTIES (
  'COLUMN_STATS_ACCURATE'='false', 
  'last_modified_by'='hue', 
  'last_modified_time'='1437506974', 
  'numFiles'='1', 
  'numRows'='-1', 
  'rawDataSize'='-1', 
  'totalSize'='55232666', 
  'transient_lastDdlTime'='1437506974');

!echo "******* Creating Table default.acftref *******";


CREATE TABLE IF NOT EXISTS default.acftref(
  code string, 
  mfr string, 
  model string, 
  type_acft bigint, 
  type_eng bigint, 
  ac_cat bigint, 
  build_cert_ind bigint, 
  no_eng bigint, 
  no_seats bigint, 
  ac_weight string, 
  speed bigint, 
  empty string)
ROW FORMAT DELIMITED 
  FIELDS TERMINATED BY ',' 
STORED AS INPUTFORMAT 
  'org.apache.hadoop.mapred.TextInputFormat' 
OUTPUTFORMAT 
  'org.apache.hadoop.hive.ql.io.HiveIgnoreKeyTextOutputFormat'
TBLPROPERTIES (
  'COLUMN_STATS_ACCURATE'='true', 
  'numFiles'='1', 
  'totalSize'='4740998', 
  'transient_lastDdlTime'='1437453318');

!echo "******* Creating Table default.reserved *******";

CREATE TABLE IF NOT EXISTS default.reserved(
  n_number string, 
  registrant string, 
  street string, 
  street2 string, 
  city string, 
  state string, 
  zipcode string, 
  rsvdate bigint, 
  tr string, 
  expdate bigint, 
  n_num_chg string, 
  empty string)
ROW FORMAT DELIMITED 
  FIELDS TERMINATED BY ',' 
STORED AS INPUTFORMAT 
  'org.apache.hadoop.mapred.TextInputFormat' 
OUTPUTFORMAT 
  'org.apache.hadoop.hive.ql.io.HiveIgnoreKeyTextOutputFormat'
LOCATION
  'hdfs://sandbox.hortonworks.com:8020/apps/hive/warehouse/reserved'
TBLPROPERTIES (
  'COLUMN_STATS_ACCURATE'='true', 
  'numFiles'='1', 
  'totalSize'='7192892', 
  'transient_lastDdlTime'='1437507161');


!echo "******* Adding the bootcamp-udf-serde.jar *******";
ADD JAR bootcamp-udf-serde.jar;

!echo "******* Creating Table default.adsb *******";
  CREATE TABLE IF NOT EXISTS adsb(
  clock string COMMENT 'from deserializer', 
  hexid string COMMENT 'from deserializer', 
  alt string COMMENT 'from deserializer', 
  ident string COMMENT 'from deserializer', 
  lon double COMMENT 'from deserializer', 
  lat double COMMENT 'from deserializer', 
  heading string COMMENT 'from deserializer', 
  squwak string COMMENT 'from deserializer', 
  airground string COMMENT 'from deserializer', 
  speed bigint COMMENT 'from deserializer')
ROW FORMAT SERDE 
  'com.thinkbiganalytics.bootcamp.serde.KeyValuePairSerde' 
STORED AS INPUTFORMAT 
  'org.apache.hadoop.mapred.TextInputFormat' 
OUTPUTFORMAT 
  'org.apache.hadoop.hive.ql.io.HiveIgnoreKeyTextOutputFormat';

!echo "******* LOADING DATA *******";

LOAD DATA INPATH '/data/MASTER.txt' OVERWRITE INTO TABLE master;
!echo "******* Successfully Loaded Master Data *******";

LOAD DATA INPATH '/data/ACFTREF.txt' OVERWRITE INTO TABLE acftref;
!echo "******* Successfully Loaded Acftref Data *******";

LOAD DATA INPATH '/data/RESERVED.txt' OVERWRITE INTO TABLE reserved;
!echo "******* Successfully Loaded Reserved Data *******";

LOAD DATA INPATH '/data/sitedata' OVERWRITE INTO table adsb;
!echo "******* Successfully Loaded ADSB Site Data *******";

!echo "******* FINISHED LOADING DATA *******";