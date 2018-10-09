'use strict';

const fs = require('fs');
const path = require('path')
const wd = process.cwd()
const iconsDir = path.join(wd, 'src/assets/svg');

fs.readdir(iconsDir, (err, icons) => {
  if (err) process.exit(1);
  icons.forEach(iconName => {
    const icon = iconName.split('-')[1].split('.')[0];
    const iconPath = path.join(iconsDir, iconName); 
    fs.readFile(iconPath, (err, svg) => {
      if (err) return;
      svg = svg.toString('utf-8');
      const iconComponent = path.join(wd, `src/app/icons/${icon}/${icon}.component.html`);
      fs.writeFile(iconComponent, svg, (err) => {
        if (err) return console.log('failed to write ' + icon + ' icon');
        console.log('successfully wrote ' + icon + ' svg')
      })
    });
  })    
});