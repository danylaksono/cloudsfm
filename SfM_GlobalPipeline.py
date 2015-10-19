#!/usr/bin/python
#! -*- encoding: utf-8 -*-

# Python implementation of the bash script written by Romuald Perrot
# Created by @vins31
# Modified by Pierre Moulon and Dany Laksono
#
# this script is for easy use of OpenMVG
#
#
# image_dir is the input directory where images are located
# output_dir is where the project must be saved
#
# if output_dir is not present script will create it
#

# Indicate the openMVG binary directory
BIN_DIR = "/usr/local/bin"

# Indicate the openMVG camera sensor width directory
CAMERA_SENSOR_WIDTH_DIRECTORY = "/home/dany/github/openMVG/src/software/SfM" + "/cameraSensorWidth"

import commands
import os, stat
import subprocess
import sys, getopt
import atexit
from time import clock

def secondsToStr(t):
    return "%d:%02d:%02d.%03d" % \
        reduce(lambda ll,b : divmod(ll[0],b) + ll[1:],
            [(t*1000,),1000,60,60])

line = "="*40
def log(s, elapsed=None):
    print line
    print secondsToStr(clock()), '-', s
    if elapsed:
        print "Elapsed time:", elapsed
    print line
    print

def endlog():
    end = clock()
    elapsed = end-start
    log("End Program", secondsToStr(elapsed))

def now():
    return secondsToStr(clock())

start = clock()
atexit.register(endlog)
log("Start Program")


if len(sys.argv) < 3:
    print ("Usage %s image_dir output_dir cam_focus" % sys.argv[0])
    sys.exit(1)


input_dir = ''
output_dir = ''
cam_focus = ''


try:
  opts, args = getopt.getopt(sys.argv[1:],"hi:o:f:",["input=","output=","focus=" ])
except getopt.GetoptError:
  print 'test.py -i <inputfile> -o <outputfile> -f <focuslength>'
  sys.exit(2)
for opt, arg in opts:
  if opt == '-h':# usage : python openmvg.py image_dir output_dir
	 print 'test.py -i <inputfile> -o <outputfile>'
	 sys.exit()
  elif opt in ("-i", "--input"):
	 input_dir = arg
  elif opt in ("-o", "--output"):
	 output_dir = arg
  elif opt in ("-f", "--focus"):
	 cam_focus = arg



#input_dir = sys.argv[1]
#output_dir = sys.argv[2]
#cam_focus = sys.argv[3]

matches_dir = os.path.join(output_dir, "matches")
reconstruction_dir = os.path.join(output_dir, "global")
mve_dir = os.path.join(output_dir, "mve")
camera_file_params = os.path.join(CAMERA_SENSOR_WIDTH_DIRECTORY, "cameraGenerated.txt")


print ("Using input dir  		: ", input_dir)
print ("      output_dir 		: ", output_dir)
print ("Estimated camera focus 	: ", cam_focus)


# Create the ouput/matches folder if not present
if not os.path.exists(output_dir):
  os.mkdir(output_dir, 0755)
if not os.path.exists(matches_dir):
  os.mkdir(matches_dir, 0755)

print ("1. Intrisics analysis")
# modified to include camera with unknown parameter
print ("Camera model or intrinsic parameter unknown. Using estimated focus")
pIntrisics = subprocess.Popen( [os.path.join(BIN_DIR, "openMVG_main_SfMInit_ImageListing"),  "-i", input_dir, "-o", matches_dir, "-f", cam_focus])
pIntrisics.wait()


print ("2. Compute features")
pFeatures = subprocess.Popen( [os.path.join(BIN_DIR, "openMVG_main_ComputeFeatures"),  "-i", matches_dir+"/sfm_data.json", "-o", matches_dir, "-m", "SIFT", "-p", "HIGH"] )
pFeatures.wait()

print ("3. Compute matches")
pMatches = subprocess.Popen( [os.path.join(BIN_DIR, "openMVG_main_ComputeMatches"),  "-i", matches_dir+"/sfm_data.json", "-o", matches_dir, "-r", "0.8", "-g", "e"] )
pMatches.wait()

# Create the reconstruction dir if not present
if not os.path.exists(reconstruction_dir):
    os.mkdir(reconstruction_dir, 0755)

print ("4. Do Global reconstruction")
pRecons = subprocess.Popen( [os.path.join(BIN_DIR, "openMVG_main_GlobalSfM"),  "-i", matches_dir+"/sfm_data.json", "-m", matches_dir, "-o", reconstruction_dir, "-r", "2", "-t", "1"] )
pRecons.wait()

print ("5. Colorize Structure")
pRecons = subprocess.Popen( [os.path.join(BIN_DIR, "openMVG_main_ComputeSfM_DataColor"),  "-i", reconstruction_dir+"/sfm_data.json", "-o", os.path.join(reconstruction_dir,"colorized.ply")] )
pRecons.wait()

# optional, compute final valid structure from the known camera poses
print ("6. Structure from Known Poses (robust triangulation)")
pRecons = subprocess.Popen( [os.path.join(BIN_DIR, "openMVG_main_ComputeStructureFromKnownPoses"),  "-i", reconstruction_dir+"/sfm_data.json", "-m", matches_dir, "-f", os.path.join(matches_dir, "matches.e.txt"), "-o", os.path.join(reconstruction_dir,"robust.json")] )
pRecons.wait()

pRecons = subprocess.Popen( [os.path.join(BIN_DIR, "openMVG_main_ComputeSfM_DataColor"),  "-i", reconstruction_dir+"/robust.json", "-o", os.path.join(reconstruction_dir,"robust_colorized.ply")] )
pRecons.wait()

# Create the mve dir if not present
if not os.path.exists(mve_dir):
    os.mkdir(mve_dir, 0755)

print ("7. Conversion to MVE Format")
pRecons = subprocess.Popen( [os.path.join(BIN_DIR, "openMVG_main_openMVG2MVE2"),  "-i", reconstruction_dir+"/sfm_data.json", "-o", mve_dir])
pRecons.wait()

print (" ")
print ("===================================================")
print ("Finished SfM Reconstruction. Continuing with MVS...")

scene_dir = mve_dir+ "/MVE"

print ("using scene dir: "+ scene_dir)

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

print ("10. MVS-Texturing (3D model + images + camera parameters --> textured 3D model)")
# MVS-Texturing
pTexrecon = subprocess.Popen( [os.path.join(BIN_DIR, "texrecon"), scene_dir+"::undistorted", scene_dir+"/surface-clean.ply", scene_dir +"/textured"])
pTexrecon.wait()


print("Finished all process!")


