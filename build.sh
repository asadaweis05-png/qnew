#!/bin/bash
set -e

echo "Building Reach Chart Pro..."
cd src-reach-chart-pro
npm install
npm run build
cd ..
rm -rf reach-chart-pro
cp -r src-reach-chart-pro/dist reach-chart-pro

echo "Building Pal Quiz Maker..."
cd src-pal-quiz-maker
npm install
npm run build
cd ..
rm -rf pal-quiz-maker
cp -r src-pal-quiz-maker/dist pal-quiz-maker

echo "Building Cine Grade Magic..."
cd src-cine-grade-magic
npm install
npm run build
cd ..
rm -rf cine-grade-magic
cp -r src-cine-grade-magic/dist cine-grade-magic

echo "Building Somali Word Sagal..."
cd src-somali-word-sagal
npm install
npm run build
cd ..
rm -rf somali-word-sagal
cp -r src-somali-word-sagal/dist somali-word-sagal

echo "All builds completed successfully."
