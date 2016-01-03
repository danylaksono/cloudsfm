#!/usr/bin/python
#! -*- encoding: utf-8 -*-
#
# Created by Dany Laksono
# Thanks to Romuald Perrot, @vins31 and Pierre Moulon
#
# This script performs background SfM processing of CloudSfM Webservice
# Input is username and project name based on CloudSfM web interface
#
# openMVG parameters are based on version 0.9 (Paracheirodons Simulans)


# Indicate the openMVG binary directory
BIN_DIR = "/usr/local/bin"

# Indicate the openMVG camera sensor width directory
CAMERA_SENSOR_WIDTH_DIRECTORY = "/home/dany/github/openMVG/src/software/SfM" + "/cameraSensorWidth"

import commands
import os, stat
import subprocess
import sys, getopt
import atexit
import json




# define arguments of this python script
if len(sys.argv) < 2:
    print ("Usage %s username projectname" % sys.argv[0])
    sys.exit(1)

try:
  opts, args = getopt.getopt(sys.argv[1:],"hw:",["workingdir="])
except getopt.GetoptError:
  print 'sfmglobal.py -u <username> -p <projectname> '
  sys.exit(2)
for opt, arg in opts:
  if opt == '-h':
	 print 'sfmglobal.py -u <username> -p <projectname> '
	 sys.exit()
  elif opt in ("-w", "--workingdir"):
	 project_dir = arg



# INITIAL PARAMETERS

project_path = project_dir

#read the parameters from settings.json
with open(project_path+'/settings.json') as params:
    sfmparams = json.load(params)

print(sfmparams['projectStatus'])
input_dir = os.path.join(project_path, "images")
output_dir = os.path.join(project_path, "output")
matches_dir = os.path.join(output_dir, "matches")
reconstruction_dir = os.path.join(output_dir, "global")
mve_dir = os.path.join(output_dir, "mve")
camera_file_params = os.path.join(CAMERA_SENSOR_WIDTH_DIRECTORY, "cameraGenerated.txt")


# =========================================================
# 		STRUCTURE FROM MOTION
# =========================================================

# Create these folders if not present
if not os.path.exists(output_dir):
  os.mkdir(output_dir, 0755)
if not os.path.exists(matches_dir):
  os.mkdir(matches_dir, 0755)
if not os.path.exists(reconstruction_dir):
    os.mkdir(reconstruction_dir, 0755)
if not os.path.exists(mve_dir):
    os.mkdir(mve_dir, 0755)


# OpenMVG Libraries
print ("1. Intrisics analysis")
if sfmparams["intrinsic"] == "focal":
  print ("Using camera focus")
  pIntrisics = subprocess.Popen([os.path.join(BIN_DIR, "openMVG_main_SfMInit_ImageListing"),  "-i", input_dir, "-o", matches_dir, "-f", sfmparams["focal"]])
  pIntrisics.wait()
else:
  print ("Using Known Calibration Matrix")
  pIntrisics = subprocess.Popen([os.path.join(BIN_DIR, "openMVG_main_SfMInit_ImageListing"),  "-i", input_dir, "-o", matches_dir, "-k", sfmparams["kmatrix"]])
  pIntrisics.wait()

print ("2. Compute features")
pFeatures = subprocess.Popen( [os.path.join(BIN_DIR, "openMVG_main_ComputeFeatures"),  "-i", matches_dir+"/sfm_data.json", "-o", matches_dir, "-m", sfmparams["featDetector"], "-u", sfmparams["isUpright"],  "-p", sfmparams["detPreset"]])
pFeatures.wait()

print ("3. Compute matches")
pMatches = subprocess.Popen( [os.path.join(BIN_DIR, "openMVG_main_ComputeMatches"),  "-i", matches_dir+"/sfm_data.json", "-o", matches_dir, "-r", sfmparams["annRatio"], "-n", sfmparams["nearMethod"], "-g", sfmparams["geomModel"]] )
pMatches.wait()

print ("4. Do Global reconstruction")
pRecons = subprocess.Popen( [os.path.join(BIN_DIR, "openMVG_main_GlobalSfM"), "-i", matches_dir+"/sfm_data.json", "-m", matches_dir, "-o", reconstruction_dir, "-r", "2", "-t", "1"] )
pRecons.wait()

print ("5. Colorize Structure")
pRecons = subprocess.Popen( [os.path.join(BIN_DIR, "openMVG_main_ComputeSfM_DataColor"),  "-i", reconstruction_dir+"/sfm_data.bin", "-o", os.path.join(reconstruction_dir,"colorized.ply")] )
pRecons.wait()

# optional, compute final valid structure from the known camera poses
print ("6. Structure from Known Poses (robust triangulation)")
pRecons = subprocess.Popen( [os.path.join(BIN_DIR, "openMVG_main_ComputeStructureFromKnownPoses"),  "-i", reconstruction_dir+"/sfm_data.bin", "-m", matches_dir, "-f", os.path.join(matches_dir, "matches.e.bin"), "-o", os.path.join(reconstruction_dir,"robust.json")] )
pRecons.wait()

pRecons = subprocess.Popen( [os.path.join(BIN_DIR, "openMVG_main_ComputeSfM_DataColor"),  "-i", reconstruction_dir+"/robust.json", "-o", os.path.join(reconstruction_dir,"robust_colorized.ply")] )
pRecons.wait()



# MULTIVIEW RECONSTRUCTION

print ("7. Conversion to MVE Format")
pRecons = subprocess.Popen( [os.path.join(BIN_DIR, "openMVG_main_openMVG2MVE2"),  "-i", reconstruction_dir+"/sfm_data.bin", "-o", mve_dir])
pRecons.wait()

print (" ")
print ("Finished SfM Reconstruction. Continuing with MVS...")
print (" ")

scene_dir = mve_dir+ "/MVE"

#print ("using scene dir: "+ scene_dir)

print ("8. Depth Map reconstruction (images + camera parameters --> depth maps)")
# Depth-map reconstruction
pDMrecon = subprocess.Popen( [os.path.join(BIN_DIR, "dmrecon"), "-s3", "-p", scene_dir])
pDMrecon.wait()
# Depth-map to point set
pPointset = subprocess.Popen( [os.path.join(BIN_DIR, "scene2pset"), "-F3", scene_dir, scene_dir+"/point-set.ply"])
pPointset.wait()

print ("9. Surface reconstruction (depth maps + camera parameters --> 3D model)")
# Floating-Scale Surface Reconstruction
pFSSR = subprocess.Popen( [os.path.join(BIN_DIR, "fssrecon"), scene_dir+"/point-set.ply", scene_dir+"/surface.ply"])
pFSSR.wait()

# Clean Reconstruction Mesh
pMeshclean = subprocess.Popen( [os.path.join(BIN_DIR, "meshclean"), "-t10", "-c10000", scene_dir+"/surface.ply", scene_dir+"/surface-clean.ply"])
pMeshclean.wait()


# TEXTURING
print (" ")
print ("Texturing Mesh...")
print (" ")

print ("10. MVS-Texturing (3D model + images + camera parameters --> textured 3D model)")
# MVS-Texturing
pTexrecon = subprocess.Popen( [os.path.join(BIN_DIR, "texrecon"), scene_dir+"::undistorted", scene_dir+"/surface-clean.ply", scene_dir +"/textured"])
pTexrecon.wait()


print(' ')
print('Updating settings.json...')
print(' ')

sfmparams['projectStatus'] = 'Finished'    

with open(project_path+'/settings.json', 'w') as params:    
    json.dump(sfmparams, params, sort_keys=True, indent=4, separators=(',', ': '))

print ("===================================================")
print(' ')
print("Finished all process!")






