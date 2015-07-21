package com.thinkbiganalytics.bootcamp.udf;

import org.apache.hadoop.hive.ql.exec.Description;
import org.apache.hadoop.hive.ql.exec.UDF;
import org.apache.hadoop.io.Text;



/**
 * Find the great-circle distance between two (lat,long) points.
 */
@Description(name = "test",
             value = "_FUNC_(string text) - Find the great circle distance (in km) between two lat/long points (in degrees).",
	     extended = "")
  public class TestUDF extends UDF {
	
      public Text evaluate(String text) {
    	  try{
	return new Text("Hello "+text);
      }
      catch(Exception e) { // if input argument data types mismatch it throws an exception
      return new Text(e.toString());
      }
    }
  }