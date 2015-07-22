package com.thinkbiganalytics.bootcamp.serde;

import java.io.Reader;
import java.io.StringWriter;
import java.io.Writer;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;

import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.hive.serde.Constants;
import org.apache.hadoop.hive.serde2.AbstractSerDe;
import org.apache.hadoop.hive.serde2.SerDeException;
import org.apache.hadoop.hive.serde2.SerDeStats;
import org.apache.hadoop.hive.serde2.objectinspector.ObjectInspector;
import org.apache.hadoop.hive.serde2.objectinspector.ObjectInspectorFactory;
import org.apache.hadoop.hive.serde2.objectinspector.StructField;
import org.apache.hadoop.hive.serde2.objectinspector.StructObjectInspector;
import org.apache.hadoop.hive.serde2.objectinspector.primitive.PrimitiveObjectInspectorFactory;
import org.apache.hadoop.hive.serde2.objectinspector.primitive.StringObjectInspector;
import org.apache.hadoop.hive.serde2.typeinfo.TypeInfo;
import org.apache.hadoop.hive.serde2.typeinfo.TypeInfoUtils;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.io.Writable;
import org.apache.log4j.Logger;

import au.com.bytecode.opencsv.CSVReader;
import au.com.bytecode.opencsv.CSVWriter;

public final class KeyValuePairSerde extends AbstractSerDe {

	private ObjectInspector inspector;
	private String[] outputFields;
	private int numCols;
	private List<Object> row;
	private Map<Integer, String> columnIndexNameMap;
	private List<String> columnNames;
	List<TypeInfo> columnTypes;

	private static Logger LOG = Logger.getLogger(KeyValuePairSerde.class);

	public Object getJavaObjectForColumn(String value, Integer column) {
		String type = this.columnTypes.get(column).getTypeName();
		if (type == "bigint") {
			return new Long(value);
		} else if (type == "double") {
			return new Double(value);
		} else if (type == "float") {
			return new Float(value);
		} else if (type == "int") {
			return new Integer(value);
		} else {
			return value;
		}
	}

	@Override
	public void initialize(final Configuration conf, final Properties tbl) throws SerDeException {
		//Store the HIVE Table Column Names and Types into objectsto use later.
		this.columnNames = Arrays.asList(tbl.getProperty(Constants.LIST_COLUMNS).split(","));
		this.columnTypes = TypeInfoUtils.getTypeInfosFromTypeString(tbl.getProperty(Constants.LIST_COLUMN_TYPES));
		LOG.info("******************** initialize SERDE.");
		numCols = columnNames.size();
		final List<ObjectInspector> columnOIs = new ArrayList<ObjectInspector>(numCols);

		columnIndexNameMap = new HashMap<Integer, String>();
		int index = 0;
		for (String columnName : columnNames) {
			this.columnIndexNameMap.put(index, columnName.toLowerCase());
			index++;
		}

		for (int i = 0; i < numCols; i++) {
			columnOIs.add(PrimitiveObjectInspectorFactory.javaStringObjectInspector);
		}

		this.inspector = ObjectInspectorFactory.getStandardStructObjectInspector(columnNames, columnOIs);
		this.outputFields = new String[numCols];
		row = new ArrayList<Object>(numCols);

		for (int i = 0; i < numCols; i++) {
			row.add(null);
		}
		LOG.info("******************** initialize SERDE. finished " + this.columnTypes);

	}

	@Override
	/**
	 * Not implemented yet.
	 */
	public Writable serialize(Object obj, ObjectInspector objInspector) throws SerDeException {

		return new Text("");
	}

	@Override
	public Object deserialize(final Writable blob) throws SerDeException {
		Text rowText = (Text) blob;

		try {
			//Get all the columns separated by a TAB
			String[] columns = rowText.toString().split("\\t");
			int count = 0;
			//Store the Column name with the column Value in a Map
			//Each Column name is in every other column.
			Map<String, String> rowMap = new HashMap<String, String>();
			String lastColumn = null;
			for (String col : columns) {
				if (count % 2 == 0) {
					lastColumn = col;
				} else {
					rowMap.put(lastColumn.toLowerCase().trim(), col.trim());
				}
				count++;
			}

			//Now that the row Map is populated set the current Row object with the correct values 
			//at the correct index.
			//Put NULL as the value if the column doesnt exist
			for (Map.Entry<Integer, String> entry : this.columnIndexNameMap.entrySet()) {
				this.row.set(entry.getKey(), rowMap.get(entry.getValue()) != null
						? getJavaObjectForColumn(rowMap.get(entry.getValue()), entry.getKey()) : null);
			}

			return row;
		} catch (final Exception e) {
			LOG.info("******************** deserialize SERDE ERROR. " + e.getMessage());
			throw new SerDeException(e);
		} finally {

		}
	}

	@Override
	public ObjectInspector getObjectInspector() throws SerDeException {
		return inspector;
	}

	@Override
	public Class<? extends Writable> getSerializedClass() {
		return Text.class;
	}

	public SerDeStats getSerDeStats() {
		return null;
	}
}
