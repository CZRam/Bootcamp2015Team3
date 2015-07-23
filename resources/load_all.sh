hadoop jar bootcamp-udf-serde.jar com.thinkbiganalytics.bootcamp.serde.ingestor.Ingestor skynet /data

hive --hiveconf hive.root.logger=INFO,console -f partitioned-tables-create.hql

hive --hiveconf hive.root.logger=INFO,console -f partitioned-tables-load.hql
