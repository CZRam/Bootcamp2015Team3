package com.thinkbiganalytics.bootcamp.serde.ingestor;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.FileSystem;
import org.apache.hadoop.fs.FileUtil;
import org.apache.hadoop.fs.Path;

import com.google.common.io.Files;

public class Ingestor {
	
	public static List<File> listFiles(File directory) {
		List<File> files = new ArrayList<File>();
		listFiles(directory, files);
		return files;
	}
	
	private static void listFiles(File directory, List<File> files) {
		for(File file : directory.listFiles()) {
			if(file.isFile()) {
				files.add(file);
			} else {
				listFiles(file, files);
			}
		}
	}
	
	private static boolean isZip(File file) {
		return file.getPath().matches(".*[zZ][iI][pP]$");
	}
	
	private static String calculateHDFSPath(File inputFolder, File file) throws IOException {
		return file.getCanonicalPath().substring(inputFolder.getCanonicalPath().length());
	}
	
	public static File unZipIt(File zipFile) {
		byte[] buffer = new byte[1024];
		File folder = Files.createTempDir();
		try {
			if (!folder.exists()) {
				folder.mkdir();
			}
			ZipInputStream zis = new ZipInputStream(new FileInputStream(zipFile));
			ZipEntry ze = zis.getNextEntry();
			while (ze != null) {
				String fileName = ze.getName();
				File newFile = new File(folder + File.separator + fileName);
				System.out.println("file unzip : " + newFile.getAbsoluteFile());
				new File(newFile.getParent()).mkdirs();
				FileOutputStream fos = new FileOutputStream(newFile);
				int len;
				while ((len = zis.read(buffer)) > 0) {
					fos.write(buffer, 0, len);
				}
				fos.close();
				ze = zis.getNextEntry();
			}
			zis.closeEntry();
			zis.close();
		} catch (IOException ex) {
			ex.printStackTrace();
		}
		return folder;
	}    
	
	public static void main(String[] args) throws IOException {
		String inputFolderPath = args[0];
		String hadoopOutputFolder = args[1];
		
		Configuration hadoopConf = new Configuration();
		
		System.out.println(String.format("%s -> hdfs://%s", inputFolderPath, hadoopOutputFolder));
		
		File inputFolder = new File(inputFolderPath);
		if(!inputFolder.isDirectory() || !inputFolder.canRead()) {
			throw new IllegalArgumentException("the input folder must exits and be readable");
		}
		String inputFolderCanonicalPath = inputFolder.getCanonicalPath();
		System.out.println(String.format("Looking for files into: %s", inputFolder));
		List<File> files = listFiles(inputFolder);
		System.out.println(String.format("%s files found", files.size()));
		
		for(int i=0; i < files.size(); i++) {
			File file = files.get(i);
			String remoteRelativePath = calculateHDFSPath(inputFolder, file.getParentFile());
			if(isZip(file)) {
				File zipFolder = unZipIt(file);
				List<File> unzippedFiles = listFiles(zipFolder);
				System.out.println(String.format("%s files unzipped from %s", unzippedFiles.size(), file));
				for(File unzippedFile : unzippedFiles) {
					if(unzippedFile.isFile()) {
						uploadToHadoop(unzippedFile, remoteRelativePath, hadoopConf, hadoopOutputFolder);
					}
				}
			} else {
				uploadToHadoop(file, remoteRelativePath, hadoopConf, hadoopOutputFolder);
			}
		}
	}

	private static boolean uploadToHadoop(File file, String remoteRelativePath, Configuration hadoopConf, String hadoopOutputFolder) throws IOException {
		FileSystem fs = FileSystem.get(hadoopConf);
		Path path = new Path(hadoopOutputFolder + remoteRelativePath + "/" + file.getName());
		System.out.println(String.format("Uploading %s -> %s", file.getPath(), path));
		return FileUtil.copy(file, fs, path, false, hadoopConf);
	}
}
