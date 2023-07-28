cd ..
cp -r am-tracklist-helper am-tracklist-helper-$VERSION
# alias the folder as a variable
FOLDER=am-tracklist-helper-$VERSION
rm -rf $FOLDER/.idea $FOLDER/.DS_Store $FOLDER/.yarn $FOLDER/node_modules
rm -rf $FOLDER/makeRelease.sh $FOLDER/README.md $FOLDER/yarn.lock $FOLDER/tsconfig.json
rm -rf $FOLDER/package.json $folder/.yarnrc.yml
