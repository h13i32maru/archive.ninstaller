#!/bin/bash

files="ninstaller.js callback_seq.js"

rm -f build/ninstaller.js build/ninstaller.min.js
for file in $files
do
    cat src/$file >> build/ninstaller.js
done

uglifyjs build/ninstaller.js --mangle --output build/ninstaller.min.js
