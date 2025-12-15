# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# Firebase keep rules (recommended to avoid stripping required classes)
-keep class com.google.firebase.** { *; }
-dontwarn com.google.firebase.**

# Keep Play Services and common Google classes used by Firebase
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.android.gms.**
