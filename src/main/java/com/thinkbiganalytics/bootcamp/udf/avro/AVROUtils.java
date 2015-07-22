package com.thinkbiganalytics.bootcamp.udf.avro;

import java.io.File;
import java.io.IOException;
import java.net.UnknownHostException;
import java.nio.ByteBuffer;
import java.util.ArrayList;
import java.util.List;

import org.apache.avro.Schema;
import org.apache.avro.file.DataFileReader;
import org.apache.avro.file.DataFileWriter;
import org.apache.avro.generic.GenericDatumReader;
import org.apache.avro.generic.GenericDatumWriter;
import org.apache.avro.generic.GenericRecord;
import org.apache.avro.io.DatumReader;
import org.apache.avro.io.DatumWriter;

import com.team3.avro.AVROFile;
import com.team3.avro.AVROFileInfo;

public class AVROUtils {

	private static final String UNKNOWN_HOST = "Unknown";

	private static String getUserName() {
		return System.getProperty("user.name"); 
	}
	
	private static String getHostname() {
		try {
			return java.net.InetAddress.getLocalHost().getHostName();
		} catch (UnknownHostException e) {
			return UNKNOWN_HOST;
		}
	}
	
	public static AVROFile toAVROFile(File file) throws IOException {
		AVROFile avroFile = new AVROFile();
		avroFile.setFilepath(file.getCanonicalPath());
		avroFile.setLastModified(file.lastModified());
		avroFile.setUsername(getUserName());
		avroFile.setHostname(getHostname());
		avroFile.setContent(ByteBuffer.allocate(0));
		
		return avroFile;
	}

	public static AVROFileInfo toAVROFileInfo(File file) {
		return null;
	}

	public static <T> void serialize(File outputAvroFile, Schema schema, T... inputs) throws IOException { 
		DatumWriter<GenericRecord> datumWriter = new GenericDatumWriter<GenericRecord>(schema);
		DataFileWriter<GenericRecord> dataFileWriter = new DataFileWriter<GenericRecord>(datumWriter);
		dataFileWriter.create(schema, outputAvroFile);
		for (T input : inputs) {
			dataFileWriter.append((GenericRecord) input);
		}
		dataFileWriter.close();
	}
	
	@SuppressWarnings("unchecked")
	public static <T> List<T> deserialse(File inputAvroFile, Schema schema) throws IOException {
		// Deserialize users from disk
		DatumReader<GenericRecord> datumReader = new GenericDatumReader<GenericRecord>(schema);
		DataFileReader<GenericRecord> dataFileReader = new DataFileReader<GenericRecord>(inputAvroFile, datumReader);
		GenericRecord genericRecord = null;
		List<T> specificRecords = new ArrayList<T>();
		while (dataFileReader.hasNext()) {
			genericRecord = dataFileReader.next(genericRecord);
			specificRecords.add((T) genericRecord);
		}
		return specificRecords;
	}
	
	public static void main(String[] args) throws IOException {
		String avroSquemaFilepath = String.valueOf(AVROUtils.class.getClassLoader().getResource("AVROFile.avsc").getFile());
		System.out.println(avroSquemaFilepath);
		Schema schema = new Schema.Parser().parse(new File(avroSquemaFilepath));
		
		File inputFile = new File("/tmp/tmp.txt");
		
		File avroFile = new File("/tmp/aFile.avro");
		
		AVROFile avroFileEntry = toAVROFile(inputFile);
		
		serialize(avroFile, schema, avroFileEntry);
		
		List<AVROFile> inputs = deserialse(avroFile, schema);
		
		System.out.println(inputs);
		
	}
}
