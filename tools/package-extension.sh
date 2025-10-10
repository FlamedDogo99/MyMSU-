node tools/build-extension.js "$1"
cd build/temp || exit
zip -r "MyMSU-$1.zip" .
zip -d "MyMSU-$1.zip" /.DS_Store
zip -d "MyMSU-$1.zip" \*/.DS_Store
mv "MyMSU-$1.zip" "../"
cd ../ || exit
if [ -d "temp" ]; then rm -Rf "temp"; fi
cd ../ || exit
echo "Successfully created build for $1"



