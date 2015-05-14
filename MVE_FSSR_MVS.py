#!/usr/bin/python
#! -*- encoding: utf-8 -*-

# Created by Dany Laksono
# 
# this script is to automate the MVE-FSSR-MVST Pipeline
# thanks to @simonfurhmann and @pmoulon
#
# usage : python MVE_FSSR_MVST.py image_dir output_dir 
#
# image_dir is the input directory where images are located 
# output_dir is where the project must be saved
# 
# if output_dir is not present script will create it 
# 

# Binary executable directory
BIN_DIR = "/usr/local/bin"

# Indicate the openMVG camera sensor width directory
#CAMERA_SENSOR_WIDTH_DIRECTORY = "/home/dany/github/openMVG/src/software/SfM" + "/cameraSensorWidth"

import commands
import os
import subprocess
import sys, getopt

if len(sys.argv) < 3:
    print ("Usage %s image_dir output_dir" % sys.argv[0])
    sys.exit(1)
    
input_dir = ''
scene_dir = ''

try:
  opts, args = getopt.getopt(sys.argv[1:],"hi:o:",["input=","scene="])
except getopt.GetoptError:
  print 'test.py -i <inputfile> -o <outputfile> '
  sys.exit(2)
for opt, arg in opts:
  if opt == '-h':
	 print 'test.py -i <inputdir> -o <scenedir>'
	 sys.exit()
  elif opt in ("-i", "--input"):
	 input_dir = arg
  elif opt in ("-o", "--scene"):
	 scene_dir = arg

print ("Using input dir : ", input_dir)
print ("      scene_dir : ", scene_dir)


# Create the ouput/matches folder if not present
if not os.path.exists(scene_dir):
  os.mkdir(scene_dir)
#if not os.path.exists(matches_dir):
 # os.mkdir(matches_dir)

print ("1. Image import & bundling (images --> camera parameters)") 
# makescene, OpenMVG to MVE or MVE-SfM
pMVE = subprocess.Popen( [os.path.join(BIN_DIR, "makescene"), "-i", input_dir, scene_dir])
pMVE.wait()

# sfmrecon, for SfM reconstruction using MVE format
pSfMrecon = subprocess.Popen( [os.path.join(BIN_DIR, "sfmrecon"), scene_dir])
pSfMrecon.wait()

print ("2. Depth Map reconstruction (images + camera parameters --> depth maps)")
# Depth-map reconstruction
pDMrecon = subprocess.Popen( [os.path.join(BIN_DIR, "dmrecon"), "-s2", scene_dir])
pDMrecon.wait()
# Depth-map to point set
pPointset = subprocess.Popen( [os.path.join(BIN_DIR, "scene2pset"), "-F2", scene_dir, "point-set.ply"])
pPointset.wait()

print ("3. Surface reconstruction (depth maps + camera parameters --> 3D model)")
# Floating-Scale Surface Reconstruction
pFSSR = subprocess.Popen( [os.path.join(BIN_DIR, "fssrecon"), "point-set.ply", "surface.ply"])
pFSSR.wait()

# Clean Reconstruction Mesh
pMeshclean = subprocess.Popen( [os.path.join(BIN_DIR, "meshclean"), "-t10", "-c10000", "surface.ply", "surface-clean.ply"])
pMeshclean.wait()

print ("4. MVS-Texturing (3D model + images + camera parameters --> textured 3D model)")
# MVS-Texturing
pTexrecon = subprocess.Popen( [os.path.join(BIN_DIR, "texrecon"), "scene::undistorted", "surface-clean.ply", "out_textured"])
pTexrecon.wait()

print("Finished all process!")
