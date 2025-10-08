node tools/build-extension.js "$1"
cd build/temp || exit
zip -r "MyMSU-$1.zip" .
mv "MyMSU-$1.zip" "../"
cd ../ || exit
if [ -d "temp" ]; then rm -Rf "temp"; fi
cd ../ || exit
echo "Successfully created build for $1"



