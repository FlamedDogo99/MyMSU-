node tools/build-extension.js "$1"
npx prettier build/temp/. --write
zip -r "build/MyMSU-$1" build/temp/.
if [ -d "build/temp" ]; then rm -Rf "build/temp"; fi
